import { NextRequest, NextResponse } from "next/server";

// Simple trigger to run cleanup job
export async function POST(request: NextRequest) {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/jobs/cancel-expired-bookings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (response.ok) {
      const result = await response.json();
      return NextResponse.json({
        success: true,
        message: 'Cleanup job triggered successfully',
        result,
      });
    } else {
      throw new Error(`Cleanup job failed: ${response.statusText}`);
    }

  } catch (error) {
    console.error('Error triggering cleanup job:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    success: true,
    message: 'Use POST to trigger expired bookings cleanup job',
    usage: {
      method: 'POST',
      endpoint: '/api/jobs/trigger-cleanup',
      description: 'Automatically cancels bookings older than 30 minutes that are still pending'
    }
  });
}