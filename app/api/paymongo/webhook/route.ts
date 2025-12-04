import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const event = body.data

    // Verify webhook signature (implement based on PayMongo docs)
    // For now, we'll process the event

    if (event.type === "subscription.updated" || event.type === "subscription.payment_succeeded") {
      const subscriptionId = event.attributes.id || event.id
      const status = event.attributes.status

      // Update subscription in database
      const subscription = await prisma.subscriptionHistory.findUnique({
        where: { paymongoSubscriptionId: subscriptionId },
      })

      if (subscription) {
        await prisma.subscriptionHistory.update({
          where: { id: subscription.id },
          data: { status },
        })

        // Update user subscription type
        if (status === "active") {
          await prisma.user.update({
            where: { id: subscription.userId },
            data: { subscriptionType: "pro" },
          })
        } else if (status === "cancelled" || status === "expired") {
          await prisma.user.update({
            where: { id: subscription.userId },
            data: { subscriptionType: "free" },
          })
        }
      }
    }

    if (event.type === "subscription.cancelled") {
      const subscriptionId = event.attributes.id || event.id

      const subscription = await prisma.subscriptionHistory.findUnique({
        where: { paymongoSubscriptionId: subscriptionId },
      })

      if (subscription) {
        await prisma.subscriptionHistory.update({
          where: { id: subscription.id },
          data: { status: "cancelled" },
        })

        await prisma.user.update({
          where: { id: subscription.userId },
          data: { subscriptionType: "free" },
        })
      }
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error("Webhook error:", error)
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    )
  }
}

