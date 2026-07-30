'use client';

import { useState, useCallback, useRef } from 'react';
import type { ScenarioResponse, Scenario } from '@/types';

interface UseAssessmentState {
  currentScenarioIndex: number;
  responses: ScenarioResponse[];
  startTime: number | null;
  selectedOptionId: string | null;
  confidenceLevel: number;
  usedVoice: boolean;
}

export function useAssessmentState() {
  const [state, setState] = useState<UseAssessmentState>({
    currentScenarioIndex: 0,
    responses: [],
    startTime: null,
    selectedOptionId: null,
    confidenceLevel: 3,
    usedVoice: false,
  });

  const scenarioStartTime = useRef<number>(Date.now());

  const startScenario = useCallback(() => {
    scenarioStartTime.current = Date.now();
    setState((prev) => ({
      ...prev,
      startTime: Date.now(),
      selectedOptionId: null,
      confidenceLevel: 3,
      usedVoice: false,
    }));
  }, []);

  const selectOption = useCallback((optionId: string) => {
    setState((prev) => ({ ...prev, selectedOptionId: optionId }));
  }, []);

  const setConfidence = useCallback((level: number) => {
    setState((prev) => ({ ...prev, confidenceLevel: level }));
  }, []);

  const markVoiceUsed = useCallback(() => {
    setState((prev) => ({ ...prev, usedVoice: true }));
  }, []);

  /** Build a response without advancing — call commitResponse after successful persist. */
  const buildResponse = useCallback(
    (
      scenario: Scenario,
      optionId: string,
      responseType: ScenarioResponse['responseType'],
      metricImpacts: Record<string, number>
    ): ScenarioResponse => {
      const timeSpentMs = Date.now() - scenarioStartTime.current;

      return {
        scenarioId: scenario.id,
        optionId,
        responseType,
        timeSpentMs,
        confidenceLevel: state.confidenceLevel,
        usedVoice: state.usedVoice,
        metricImpacts,
        answeredAt: new Date().toISOString(),
      };
    },
    [state.confidenceLevel, state.usedVoice]
  );

  const commitResponse = useCallback((response: ScenarioResponse) => {
    setState((prev) => ({
      ...prev,
      responses: [...prev.responses, response],
      currentScenarioIndex: prev.currentScenarioIndex + 1,
    }));
  }, []);

  const submitResponse = useCallback(
    (
      scenario: Scenario,
      optionId: string,
      responseType: ScenarioResponse['responseType'],
      metricImpacts: Record<string, number>
    ): ScenarioResponse => {
      const response = buildResponse(scenario, optionId, responseType, metricImpacts);
      commitResponse(response);
      return response;
    },
    [buildResponse, commitResponse]
  );

  const reset = useCallback(() => {
    setState({
      currentScenarioIndex: 0,
      responses: [],
      startTime: null,
      selectedOptionId: null,
      confidenceLevel: 3,
      usedVoice: false,
    });
  }, []);

  return {
    ...state,
    startScenario,
    selectOption,
    setConfidence,
    markVoiceUsed,
    buildResponse,
    commitResponse,
    submitResponse,
    reset,
  };
}
