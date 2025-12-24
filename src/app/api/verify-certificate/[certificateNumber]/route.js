import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(request, { params }) {
  try {
    const { certificateNumber } = params

    if (!certificateNumber) {
      return NextResponse.json(
        { error: 'Certificate number is required' },
        { status: 400 }
      )
    }

    const certificate = await prisma.certificate.findUnique({
      where: {
        certificateNumber: certificateNumber
      },
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        },
        quizAttempt: {
          select: {
            score: true,
            totalQuestions: true,
            percentage: true,
            createdAt: true
          }
        }
      }
    })

    if (!certificate) {
      return NextResponse.json(
        { error: 'Certificate not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      valid: true,
      certificate: {
        certificateNumber: certificate.certificateNumber,
        issuedAt: certificate.issuedAt,
        user: {
          name: certificate.user.name,
          email: certificate.user.email
        },
        quizAttempt: {
          score: certificate.quizAttempt.score,
          totalQuestions: certificate.quizAttempt.totalQuestions,
          percentage: certificate.quizAttempt.percentage,
          completedAt: certificate.quizAttempt.createdAt
        }
      }
    })

  } catch (error) {
    console.error('Certificate verification error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}