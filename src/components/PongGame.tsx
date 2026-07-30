'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { readGameTokens, GameTokens, RunGate } from '@/lib/gameTokens';

const ASPECT = 400 / 600; // matches prototype's 600x400 canvas
const PADDLE_W = 10;
const PADDLE_H = 60;
const BLOCK = 10;
const WIN_SCORE = 5;
const BASE_VX = 4;
const CPU_SPEED = 3.4;

type Tokens = GameTokens;

export default function PongGame() {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [score, setScore] = useState({ left: 0, right: 0 });
  const [status, setStatus] = useState('move mouse, drag, or use ↑ ↓ to play');
  const [winner, setWinner] = useState<string | null>(null);

  // Mutable game state lives in refs so the RAF loop never depends on React re-renders.
  const state = useRef({
    W: 600,
    H: 400,
    leftY: 170,
    rightY: 170,
    ballX: 300,
    ballY: 200,
    ballVX: BASE_VX,
    ballVY: 3,
    running: true,
    leftMoving: false,
    rightMoving: false,
    scoreLeft: 0,
    scoreRight: 0,
    tokens: null as Tokens | null,
  });

  const gate = useRef<RunGate>({ visible: false, active: true });
  const rafId = useRef<number | null>(null);
  const moveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dragging = useRef(false);

  const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));

  const resetBall = useCallback((direction: number) => {
    const s = state.current;
    s.ballX = s.W / 2;
    s.ballY = s.H / 2;
    s.ballVX = BASE_VX * direction;
    s.ballVY = Math.random() * 4 - 2 || 3;
  }, []);

  const markMoved = useCallback(() => {
    state.current.leftMoving = true;
    if (moveTimer.current) clearTimeout(moveTimer.current);
    moveTimer.current = setTimeout(() => {
      state.current.leftMoving = false;
    }, 300);
  }, []);

  const setPaddleFromClientY = useCallback((clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const s = state.current;
    const y = (clientY - rect.top) * (s.H / rect.height);
    s.leftY = y - PADDLE_H / 2;
    markMoved();
  }, [markMoved]);

  const endGame = useCallback((text: string) => {
    const s = state.current;
    s.running = false;
    setWinner(text);
    setStatus(text);
  }, []);

  const restart = useCallback(() => {
    const s = state.current;
    s.scoreLeft = 0;
    s.scoreRight = 0;
    setScore({ left: 0, right: 0 });
    setWinner(null);
    setStatus('move mouse, drag, or use ↑ ↓ to play');
    resetBall(1);
    s.running = true;
  }, [resetBall]);

  // Resize canvas to fit its container, matching the 3:2 aspect ratio, crisp at any DPR.
  const resize = useCallback(() => {
    const canvas = canvasRef.current;
    const wrapper = wrapperRef.current;
    if (!canvas || !wrapper) return;
    const displayW = Math.min(wrapper.clientWidth, 700);
    const displayH = displayW * ASPECT;
    const dpr = window.devicePixelRatio || 1;

    canvas.style.width = `${displayW}px`;
    canvas.style.height = `${displayH}px`;
    canvas.width = displayW * dpr;
    canvas.height = displayH * dpr;

    const ctx = canvas.getContext('2d');
    if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const s = state.current;
    s.W = displayW;
    s.H = displayH;
    s.leftY = clamp(s.leftY, 0, s.H - PADDLE_H);
    s.rightY = clamp(s.rightY, 0, s.H - PADDLE_H);
    s.ballX = clamp(s.ballX, 0, s.W);
    s.ballY = clamp(s.ballY, 0, s.H);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrapper = wrapperRef.current;
    if (!canvas || !wrapper) return;

    state.current.tokens = readGameTokens();
    resize();
    resetBall(1);

    const ro = new ResizeObserver(() => resize());
    ro.observe(wrapper);

    // --- Controls ---
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        state.current.leftY -= 24;
        markMoved();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        state.current.leftY += 24;
        markMoved();
      }
    };

    const onMouseMove = (e: MouseEvent) => setPaddleFromClientY(e.clientY);

    const onTouchStart = (e: TouchEvent) => {
      dragging.current = true;
      setPaddleFromClientY(e.touches[0].clientY);
    };
    const onTouchMove = (e: TouchEvent) => {
      if (!dragging.current) return;
      e.preventDefault();
      setPaddleFromClientY(e.touches[0].clientY);
    };
    const onTouchEnd = () => {
      dragging.current = false;
    };

    // Keyboard is scoped to the canvas itself (focus-based) so arrow keys
    // don't hijack page scrolling anywhere else on the site.
    canvas.tabIndex = 0;
    canvas.addEventListener('keydown', onKeyDown);
    canvas.addEventListener('mousemove', onMouseMove);
    canvas.addEventListener('touchstart', onTouchStart, { passive: true });
    canvas.addEventListener('touchmove', onTouchMove, { passive: false });
    canvas.addEventListener('touchend', onTouchEnd);
    canvas.addEventListener('touchcancel', onTouchEnd);

    // --- Visibility: pause the render loop when off-screen or the tab is hidden ---
    const io = new IntersectionObserver(
      ([entry]) => {
        gate.current.visible = entry.isIntersecting;
      },
      { threshold: 0.1 }
    );
    io.observe(wrapper);

    const onVisibilityChange = () => {
      gate.current.active = !document.hidden;
    };
    document.addEventListener('visibilitychange', onVisibilityChange);

    // --- Game loop ---
    let blinkPhase = 0;

    const update = () => {
      const s = state.current;
      if (!s.running) return;

      s.leftY = clamp(s.leftY, 0, s.H - PADDLE_H);

      const targetY = s.ballY - PADDLE_H / 2 + (Math.random() * 20 - 10);
      if (s.rightY < targetY) {
        s.rightY += CPU_SPEED;
        s.rightMoving = true;
      } else if (s.rightY > targetY) {
        s.rightY -= CPU_SPEED;
        s.rightMoving = true;
      } else {
        s.rightMoving = false;
      }
      s.rightY = clamp(s.rightY, 0, s.H - PADDLE_H);

      s.ballX += s.ballVX;
      s.ballY += s.ballVY;

      if (s.ballY <= BLOCK / 2 || s.ballY >= s.H - BLOCK / 2) {
        s.ballVY *= -1;
      }

      if (s.ballX - BLOCK / 2 <= PADDLE_W && s.ballY >= s.leftY && s.ballY <= s.leftY + PADDLE_H) {
        s.ballVX = Math.abs(s.ballVX) * 1.03;
        s.ballVY += (s.ballY - (s.leftY + PADDLE_H / 2)) * 0.08;
        s.ballX = PADDLE_W + BLOCK / 2;
      }

      if (s.ballX + BLOCK / 2 >= s.W - PADDLE_W && s.ballY >= s.rightY && s.ballY <= s.rightY + PADDLE_H) {
        s.ballVX = -Math.abs(s.ballVX) * 1.03;
        s.ballVY += (s.ballY - (s.rightY + PADDLE_H / 2)) * 0.08;
        s.ballX = s.W - PADDLE_W - BLOCK / 2;
      }

      if (s.ballX < 0) {
        s.scoreRight++;
        setScore({ left: s.scoreLeft, right: s.scoreRight });
        if (s.scoreRight >= WIN_SCORE) endGame('CPU WINS');
        resetBall(1);
      }

      if (s.ballX > s.W) {
        s.scoreLeft++;
        setScore({ left: s.scoreLeft, right: s.scoreRight });
        if (s.scoreLeft >= WIN_SCORE) endGame('YOU WIN');
        resetBall(-1);
      }
    };

    const drawPaddle = (ctx: CanvasRenderingContext2D, x: number, y: number, moving: boolean, tokens: Tokens) => {
      const solid = moving || blinkPhase < 0.5;
      ctx.fillStyle = solid ? tokens.text : tokens.bg;
      ctx.strokeStyle = tokens.text;
      ctx.lineWidth = 1;
      ctx.strokeRect(x, y, PADDLE_W, PADDLE_H);
      if (solid) ctx.fillRect(x, y, PADDLE_W, PADDLE_H);
    };

    const draw = () => {
      const ctx = canvas.getContext('2d');
      const s = state.current;
      const tokens = s.tokens;
      if (!ctx || !tokens) return;

      ctx.clearRect(0, 0, s.W, s.H);
      ctx.fillStyle = tokens.bg;
      ctx.fillRect(0, 0, s.W, s.H);

      ctx.strokeStyle = tokens.faint;
      ctx.setLineDash([4, 6]);
      ctx.beginPath();
      ctx.moveTo(s.W / 2, 0);
      ctx.lineTo(s.W / 2, s.H);
      ctx.stroke();
      ctx.setLineDash([]);

      drawPaddle(ctx, 0, s.leftY, s.leftMoving, tokens);
      drawPaddle(ctx, s.W - PADDLE_W, s.rightY, s.rightMoving, tokens);

      ctx.fillStyle = tokens.text;
      ctx.fillRect(s.ballX - BLOCK / 2, s.ballY - BLOCK / 2, BLOCK, BLOCK);

      ctx.strokeStyle = tokens.faintStrong;
      ctx.strokeRect(0.5, 0.5, s.W - 1, s.H - 1);
    };

    const loop = (time: number) => {
      blinkPhase = (time / 1000) % 1;
      if (gate.current.visible && gate.current.active) {
        update();
        draw();
      }
      rafId.current = requestAnimationFrame(loop);
    };
    rafId.current = requestAnimationFrame(loop);

    return () => {
      if (rafId.current) cancelAnimationFrame(rafId.current);
      if (moveTimer.current) clearTimeout(moveTimer.current);
      ro.disconnect();
      io.disconnect();
      document.removeEventListener('visibilitychange', onVisibilityChange);
      canvas.removeEventListener('keydown', onKeyDown);
      canvas.removeEventListener('mousemove', onMouseMove);
      canvas.removeEventListener('touchstart', onTouchStart);
      canvas.removeEventListener('touchmove', onTouchMove);
      canvas.removeEventListener('touchend', onTouchEnd);
      canvas.removeEventListener('touchcancel', onTouchEnd);
    };
  }, [resize, resetBall, endGame, setPaddleFromClientY, markMoved]);

  return (
    <div ref={wrapperRef} className="pong-wrapper">
      <div className="scoreboard">
        <span className="score">{score.left}</span>
        <span className="vs">:</span>
        <span className="score">{score.right}</span>
      </div>

      <canvas
        ref={canvasRef}
        className="pong-canvas"
        role="img"
        aria-label="Pong game. Use the up and down arrow keys, mouse, or touch drag to move your paddle."
      />

      <div className={`status${winner ? ' winner' : ''}`}>
        {status}
        <span className="with-cursor" />
      </div>

      {winner && (
        <button className="restart" onClick={restart}>restart</button>
      )}

      <style jsx>{`
        .pong-wrapper {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1.25rem;
          width: 100%;
        }

        .scoreboard {
          display: flex;
          align-items: center;
          gap: 2rem;
          font-family: var(--font-mono);
          font-size: 1.5rem;
          font-weight: bold;
        }

        .score {
          min-width: 2rem;
          text-align: center;
        }

        .vs {
          opacity: 0.3;
          font-size: 0.9rem;
        }

        .pong-canvas {
          max-width: 100%;
          touch-action: none;
          cursor: none;
        }

        .pong-canvas:focus-visible {
          outline: 1px solid var(--text-color);
          outline-offset: 4px;
        }

        .status {
          font-family: var(--font-mono);
          font-size: 0.8rem;
          text-transform: uppercase;
          letter-spacing: 1px;
          opacity: 0.6;
          text-align: center;
          min-height: 1.2rem;
        }

        .status.winner {
          color: var(--accent-color);
          opacity: 1;
          font-weight: bold;
        }

        .restart {
          background: transparent;
          border: 1px solid rgba(26, 26, 26, 0.2);
          color: var(--text-color);
          font-family: var(--font-mono);
          font-size: 0.8rem;
          letter-spacing: 1.5px;
          text-transform: uppercase;
          padding: 0.6rem 1.5rem;
          cursor: pointer;
          transition: border-color 0.2s ease;
        }

        .restart:hover {
          border-color: var(--text-color);
        }
      `}</style>
    </div>
  );
}
