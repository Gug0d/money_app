// src/services/ai.ts

import {
  AiGameState,
  GenerateMissionsRequest,
  GenerateMissionsResponse,
} from '../types/ai';

const LOCAL_AI_SERVER_URL = 'http://192.168.1.2:3001';

type AskAdvisorResponse = {
  answer: string;
};

async function requestJson<TResponse>(
  url: string,
  body: Record<string, unknown>
): Promise<TResponse> {
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  const text = await response.text();

  let data: any = {};

  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    data = {};
  }

  if (!response.ok) {
    console.log('[AI service] server error:', data);
    throw new Error(data?.error || text || 'Ошибка запроса к ИИ-серверу.');
  }

  return data as TResponse;
}

export async function askAiAdvisor(
  question: string,
  gameState: AiGameState
): Promise<string> {
  const data = await requestJson<AskAdvisorResponse>(
    `${LOCAL_AI_SERVER_URL}/ask-advisor`,
    {
      question,
      gameState,
    }
  );

  return data.answer;
}

export async function generateAiMissions(
  payload: GenerateMissionsRequest
): Promise<GenerateMissionsResponse['missions']> {
  const data = await requestJson<GenerateMissionsResponse>(
    `${LOCAL_AI_SERVER_URL}/generate-missions`,
    payload as unknown as Record<string, unknown>
  );

  return data.missions;
}