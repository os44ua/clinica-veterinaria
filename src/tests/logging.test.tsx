import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

/*
 Test unitario del servicio de logging que verifica todos los niveles de log.
 Usa vi.unmock() para obtener la implementación real del logger (evitando el mock global de setup.ts).
 Mockea console methods para verificar que el logger real efectivamente los llama.
 */

vi.unmock('../services/logging');
import logger from '../services/logging';

// Mock console methods
const originalConsole = global.console;

describe('Logger Service', () => {
  beforeEach(() => {
    global.console = {
      ...originalConsole,
      info: vi.fn(),
      error: vi.fn(),
      warn: vi.fn(),
      debug: vi.fn()
    };
  });

  afterEach(() => {
    global.console = originalConsole;
  });

  it('debe loggear mensajes info correctamente', () => {
    logger.info('Mensaje de prueba');
    
    expect(console.info).toHaveBeenCalledWith(
      expect.stringContaining('[INFO]')
    );
    expect(console.info).toHaveBeenCalledWith(
      expect.stringContaining('Mensaje de prueba')
    );
  });

  it('debe loggear errores con información adicional', () => {
    const error = new Error('Error de prueba');
    logger.error('Error ocurrido', error);
    
    // Verificar que se llamó console.error
    expect(console.error).toHaveBeenCalled();
    
    // Verificar que el mensaje contiene la información esperada
    const callArgs = (console.error as any).mock.calls[0][0];
    expect(callArgs).toContain('[ERROR]');
    expect(callArgs).toContain('Error ocurrido');
    expect(callArgs).toContain('Error de prueba');
  });

  it('debe loggear solo errores simples sin objeto error', () => {
    logger.error('Error simple');
    
    expect(console.error).toHaveBeenCalled();
    const callArgs = (console.error as any).mock.calls[0][0];
    expect(callArgs).toContain('[ERROR]');
    expect(callArgs).toContain('Error simple');
  });

  it('debe loggear warnings correctamente', () => {
    logger.warn('Mensaje de advertencia');
    
    expect(console.warn).toHaveBeenCalled();
    const callArgs = (console.warn as any).mock.calls[0][0];
    expect(callArgs).toContain('[WARN]');
    expect(callArgs).toContain('Mensaje de advertencia');
  });

  it('debe loggear debug correctamente', () => {
    logger.debug('Mensaje de debug');
    
    expect(console.debug).toHaveBeenCalled();
    const callArgs = (console.debug as any).mock.calls[0][0];
    expect(callArgs).toContain('[DEBUG]');
    expect(callArgs).toContain('Mensaje de debug');
  });
});