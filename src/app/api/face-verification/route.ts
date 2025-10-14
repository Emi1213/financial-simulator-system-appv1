// src/app/api/face-verification/route.ts
import { NextResponse } from 'next/server';
import { faceRecognitionService } from '@/lib/faceRecognition';

export async function POST(request: Request) {
  console.log('=== FACE VERIFICATION API CALLED (Face++) ===');
  
  try {
    const body = await request.json();
    console.log('Request body keys:', Object.keys(body));
    
    const { cedulaUrl, selfieUrl } = body;

    if (!cedulaUrl || !selfieUrl) {
      console.log('Missing image URLs');
      return NextResponse.json({ 
        error: 'Faltan URLs de las imágenes',
        received: { cedulaUrl: !!cedulaUrl, selfieUrl: !!selfieUrl }
      }, { status: 400 });
    }

    console.log('Comparing faces with URLs:', { cedulaUrl, selfieUrl });

    // Usar el servicio Face++ para comparar las imágenes
    const comparisonResult = await faceRecognitionService.compareFaces(cedulaUrl, selfieUrl);
    
    console.log('Face++ comparison result:', comparisonResult);

    return NextResponse.json({
      isMatch: comparisonResult.isMatch,
      confidence: comparisonResult.confidence,
      threshold: comparisonResult.threshold,
      requestId: comparisonResult.requestId,
      timeUsed: comparisonResult.timeUsed,
      success: true
    });

  } catch (error: any) {
    console.error('Error in face verification:', error);
    
    return NextResponse.json({
      error: error.message || 'Error en la verificación facial',
      isMatch: false,
      confidence: 0,
      success: false,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }, { status: 500 });
  }
}