import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { createSubscription } from "@/lib/paymongo"
import { prisma } from "@/lib/db"

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { customerId } = await request.json()

    if (!customerId) {
      return NextResponse.json(
        { error: "Customer ID is required" },
        { status: 400 }
      )
    }

    // Create subscription in PayMongo
    const subscription = await createSubscription(customerId, 20, {
      userId: user.id,
      email: user.email,
    })

    // Store subscription in database
    await prisma.subscriptionHistory.create({
      data: {
        userId: user.id,
        paymongoSubscriptionId: subscription.data.id,
        status: subscription.data.attributes.status,
        amount: subscription.data.attributes.amount / 100, // Convert from cents
      },
    })

    // Update user subscription type
    await prisma.user.update({
      where: { id: user.id },
      data: { subscriptionType: "pro" },
    })

    return NextResponse.json({
      subscriptionId: subscription.data.id,
      status: subscription.data.attributes.status,
    })
  } catch (error: any) {
    console.error("Subscription creation error:", error)
    return NextResponse.json(
      { error: error.message || "Failed to create subscription" },
      { status: 500 }
    )
  }
}

