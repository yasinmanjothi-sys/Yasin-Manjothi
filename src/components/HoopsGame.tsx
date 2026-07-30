'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { readGameTokens, GameTokens, RunGate } from '@/lib/gameTokens';

// Fixed logical coordinate space matching the prototype's 440x520 canvas
// exactly — physics/geometry constants below are tuned for these numbers,
// so the canvas is scaled visually via a transform rather than by
// recomputing gameplay math at other sizes (unlike PongGame).
const LOGICAL_W = 440;
const LOGICAL_H = 520;

const GRAVITY = 0.3;
const HOOP_X = LOGICAL_W / 2;
const HOOP_Y = 120;
const RIM_HALF_W = 34;
const START_X = LOGICAL_W / 2;
const START_Y = LOGICAL_H - 90;
const BALL_R = 12;
const SHOT_CLOCK = 24;

const BB_X0 = HOOP_X - 40;
const BB_X1 = HOOP_X + 40;
const BB_Y0 = HOOP_Y - 45;
const BB_Y1 = HOOP_Y - 18;
const RIM_EDGE_R = 5;
const RIM_L_CX = HOOP_X - RIM_HALF_W;
const RIM_L_CY = HOOP_Y;
const RIM_R_CX = HOOP_X + RIM_HALF_W;
const RIM_R_CY = HOOP_Y;

interface Point {
  x: number;
  y: number;
}

export default function HoopsGame() {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(0);
  const [timeLeft, setTimeLeft] = useState(SHOT_CLOCK);
  const [status, setStatus] = useState('drag back from the ball and release to shoot');
  const [gameOver, setGameOver] = useState(false);

  const state = useRef({
    ball: { x: START_X, y: START_Y, vx: 0, vy: 0, inFlight: false, r: BALL_R },
    dragging: false,
    dragStart: null as Point | null,
    dragCurrent: null as Point | null,
    ballIdle: true,
    score: 0,
    best: 0,
    timeLeft: SHOT_CLOCK,
    running: true,
    scoredThisFlight: false,
    hitBackboard: false,
    hitRim: false,
    flashText: null as string | null,
    flashTimer: 0,
    tokens: null as GameTokens | null,
    displayScale: 1,
  });

  const gate = useRef<RunGate>({ visible: false, active: true });
  const rafId = useRef<number | null>(null);
  const clockInterval = useRef<ReturnType<typeof setInterval> | null>(null);
  const resetTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const resetBall = useCallback(() => {
    const s = state.current;
    s.ball.x = START_X;
    s.ball.y = START_Y;
    s.ball.vx = 0;
    s.ball.vy = 0;
    s.ball.inFlight = false;
    s.scoredThisFlight = false;
    s.hitBackboard = false;
    s.hitRim = false;
  }, []);

  const endGame = useCallback(() => {
    const s = state.current;
    s.running = false;
    s.best = Math.max(s.best, s.score);
    setBest(s.best);
    setGameOver(true);
    setStatus(`time up — final score ${s.score}`);
  }, []);

  const restart = useCallback(() => {
    const s = state.current;
    s.score = 0;
    s.timeLeft = SHOT_CLOCK;
    s.running = true;
    setScore(0);
    setTimeLeft(SHOT_CLOCK);
    setGameOver(false);
    setStatus('drag back from the ball and release to shoot');
    resetBall();
  }, [resetBall]);

  const pointFromClient = useCallback((clientX: number, clientY: number): Point => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return {
      x: (clientX - rect.left) * (LOGICAL_W / rect.width),
      y: (clientY - rect.top) * (LOGICAL_H / rect.height),
    };
  }, []);

  // Fit the fixed 440x520 logical canvas into the container width, crisp at any DPR.
  const resize = useCallback(() => {
    const canvas = canvasRef.current;
    const wrapper = wrapperRef.current;
    if (!canvas || !wrapper) return;
    const displayW = Math.min(wrapper.clientWidth, LOGICAL_W);
    const scale = displayW / LOGICAL_W;
    const displayH = LOGICAL_H * scale;
    const dpr = window.devicePixelRatio || 1;

    canvas.style.width = `${displayW}px`;
    canvas.style.height = `${displayH}px`;
    canvas.width = displayW * dpr;
    canvas.height = displayH * dpr;

    const ctx = canvas.getContext('2d');
    if (ctx) ctx.setTransform(scale * dpr, 0, 0, scale * dpr, 0, 0);

    state.current.displayScale = scale;
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrapper = wrapperRef.current;
    if (!canvas || !wrapper) return;

    state.current.tokens = readGameTokens();
    resize();
    resetBall();

    const ro = new ResizeObserver(() => resize());
    ro.observe(wrapper);

    // --- Controls (drag-back-and-release) ---
    const onDown = (p: Point) => {
      const s = state.current;
      if (!s.running || s.ball.inFlight) return;
      s.dragging = true;
      s.dragStart = { x: s.ball.x, y: s.ball.y };
      s.dragCurrent = p;
      s.ballIdle = false;
    };

    const onMove = (p: Point) => {
      const s = state.current;
      if (!s.dragging) return;
      s.dragCurrent = p;
    };

    const onUp = () => {
      const s = state.current;
      if (!s.dragging || !s.dragStart || !s.dragCurrent) return;
      s.dragging = false;
      const dx = s.dragStart.x - s.dragCurrent.x;
      const dy = s.dragStart.y - s.dragCurrent.y;
      const dist = Math.hypot(dx, dy);
      if (dist < 12) {
        s.ballIdle = true;
        return;
      }
      const power = Math.min(dist * 0.12, 22);
      const angle = Math.atan2(dy, dx);
      s.ball.vx = Math.cos(angle) * power;
      s.ball.vy = Math.sin(angle) * power;
      s.ball.inFlight = true;
      setStatus('in the air');
    };

    // Mouse: mirrors the prototype (window-level move/up so a drag survives
    // the cursor leaving the canvas mid-gesture).
    const onMouseDown = (e: MouseEvent) => onDown(pointFromClient(e.clientX, e.clientY));
    const onMouseMove = (e: MouseEvent) => onMove(pointFromClient(e.clientX, e.clientY));
    const onMouseUp = () => onUp();

    // Touch: scoped to the canvas element with preventDefault while
    // dragging, matching PongGame's touch integration pattern.
    const onTouchStart = (e: TouchEvent) => {
      onDown(pointFromClient(e.touches[0].clientX, e.touches[0].clientY));
    };
    const onTouchMove = (e: TouchEvent) => {
      if (!state.current.dragging) return;
      e.preventDefault();
      onMove(pointFromClient(e.touches[0].clientX, e.touches[0].clientY));
    };
    const onTouchEnd = () => onUp();

    canvas.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    canvas.addEventListener('touchstart', onTouchStart, { passive: true });
    canvas.addEventListener('touchmove', onTouchMove, { passive: false });
    canvas.addEventListener('touchend', onTouchEnd);
    canvas.addEventListener('touchcancel', onTouchEnd);

    // --- Visibility: pause the render loop and shot clock when off-screen ---
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

    clockInterval.current = setInterval(() => {
      if (!gate.current.visible || !gate.current.active) return;
      const s = state.current;
      if (!s.running) return;
      s.timeLeft--;
      setTimeLeft(s.timeLeft);
      if (s.timeLeft <= 0) endGame();
    }, 1000);

    // --- Physics (ported 1:1 from the prototype) ---
    const checkBackboardCollision = () => {
      const s = state.current;
      const b = s.ball;
      if (Math.abs(b.x - HOOP_X) < 15) return; // deliberate: dead-center shots skip the backboard
      const r = 2;
      const overlapsX = b.x + r > BB_X0 && b.x - r < BB_X1;
      const overlapsY = b.y + r > BB_Y0 && b.y - r < BB_Y1;
      if (overlapsX && overlapsY) {
        s.hitBackboard = true;
        if (b.vy < 0) {
          b.y = BB_Y1 + b.r + 1;
          b.vy *= -0.55;
        } else {
          b.x = b.x < HOOP_X ? BB_X0 - b.r - 1 : BB_X1 + b.r + 1;
          b.vx *= -0.5;
        }
      }
    };

    const bounceOffRimEdge = (cx: number, cy: number) => {
      const s = state.current;
      const b = s.ball;
      const dx = b.x - cx;
      const dy = b.y - cy;
      const dist = Math.hypot(dx, dy) || 0.001;
      const minDist = b.r + RIM_EDGE_R;
      if (dist >= minDist) return false;

      const nx = dx / dist;
      const ny = dy / dist;
      const dot = b.vx * nx + b.vy * ny;
      const restitution = 0.62;
      b.vx = (b.vx - 2 * dot * nx) * restitution;
      b.vy = (b.vy - 2 * dot * ny) * restitution;
      b.x = cx + nx * minDist;
      b.y = cy + ny * minDist;
      return true;
    };

    const checkRimEdgeCollision = () => {
      const s = state.current;
      const hitLeft = bounceOffRimEdge(RIM_L_CX, RIM_L_CY);
      const hitRight = bounceOffRimEdge(RIM_R_CX, RIM_R_CY);
      if (hitLeft || hitRight) s.hitRim = true;
    };

    const checkScore = () => {
      const s = state.current;
      const b = s.ball;
      if (s.hitBackboard || s.hitRim) return;
      const withinX = Math.abs(b.x - HOOP_X) < RIM_HALF_W - 2;
      const crossingDown = b.vy > 0;
      const nearRim = Math.abs(b.y - HOOP_Y) < 10;
      if (!(withinX && crossingDown && nearRim && !s.scoredThisFlight)) return;

      const entryAngleDeg = (Math.atan2(b.vy, Math.abs(b.vx)) * 180) / Math.PI;
      const speed = Math.hypot(b.vx, b.vy);

      // Overpowered/too-flat shots rattle out — deliberate, not a bug.
      if (entryAngleDeg < 28 || speed > 13) {
        s.hitRim = true;
        b.vy *= -0.5;
        b.vx *= -0.7;
        return;
      }
      if (entryAngleDeg < 42 && Math.random() < 0.35) {
        s.hitRim = true;
        b.vy *= -0.5;
        b.vx *= -0.7;
        return;
      }

      s.scoredThisFlight = true;
      s.score++;
      setScore(s.score);
      s.flashText = 'SWISH';
      s.flashTimer = 45;
      setStatus('swish');
    };

    const update = () => {
      const s = state.current;
      const b = s.ball;
      if (!s.running) return;

      if (b.inFlight) {
        b.vy += GRAVITY;
        b.x += b.vx;
        b.y += b.vy;
        checkBackboardCollision();
        checkRimEdgeCollision();
        checkScore();

        if (b.x < 0 || b.x > LOGICAL_W || b.y > LOGICAL_H + 40) {
          if (!s.scoredThisFlight) {
            setStatus(s.hitBackboard || s.hitRim ? 'rattled out' : 'missed');
          }
          if (resetTimeout.current) clearTimeout(resetTimeout.current);
          resetTimeout.current = setTimeout(resetBall, 260);
          b.inFlight = false;
          s.ballIdle = true;
        }
      }

      if (s.flashTimer > 0) s.flashTimer--;
      else s.flashText = null;
    };

    const drawHoop = (ctx: CanvasRenderingContext2D, tokens: GameTokens) => {
      ctx.strokeStyle = tokens.text;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(HOOP_X - RIM_HALF_W, HOOP_Y);
      ctx.lineTo(HOOP_X + RIM_HALF_W, HOOP_Y);
      ctx.stroke();

      ctx.strokeStyle = tokens.faintStrong;
      ctx.lineWidth = 1;
      ctx.setLineDash([3, 4]);
      ctx.beginPath();
      for (let i = -2; i <= 2; i++) {
        const nx = HOOP_X + (RIM_HALF_W / 3) * i;
        ctx.moveTo(nx, HOOP_Y + 2);
        ctx.lineTo(nx * 0.4 + HOOP_X * 0.6, HOOP_Y + 34);
      }
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle = tokens.text;
      ctx.fillRect(HOOP_X - 40, HOOP_Y - 45, 80, 30);
      ctx.fillStyle = tokens.bg;
      ctx.fillRect(HOOP_X - 34, HOOP_Y - 40, 68, 20);

      ctx.strokeStyle = tokens.text;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(HOOP_X, HOOP_Y - 15);
      ctx.lineTo(HOOP_X, HOOP_Y);
      ctx.stroke();

      ctx.fillStyle = tokens.text;
      ctx.beginPath();
      ctx.arc(RIM_L_CX, RIM_L_CY, RIM_EDGE_R, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(RIM_R_CX, RIM_R_CY, RIM_EDGE_R, 0, Math.PI * 2);
      ctx.fill();
    };

    const drawBall = (ctx: CanvasRenderingContext2D, tokens: GameTokens, blinkPhase: number) => {
      const s = state.current;
      const b = s.ball;
      const solid = b.inFlight || !s.ballIdle || blinkPhase < 0.5;
      ctx.strokeStyle = tokens.text;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
      ctx.stroke();
      if (solid) {
        ctx.fillStyle = tokens.text;
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    const drawAimLine = (ctx: CanvasRenderingContext2D, tokens: GameTokens) => {
      const s = state.current;
      if (!s.dragging || !s.dragCurrent || !s.dragStart) return;
      ctx.strokeStyle = tokens.faintStrong;
      ctx.setLineDash([4, 4]);
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(s.ball.x, s.ball.y);
      const dx = s.dragStart.x - s.dragCurrent.x;
      const dy = s.dragStart.y - s.dragCurrent.y;
      ctx.lineTo(s.ball.x + dx, s.ball.y + dy);
      ctx.stroke();
      ctx.setLineDash([]);
    };

    const drawFloor = (ctx: CanvasRenderingContext2D, tokens: GameTokens) => {
      ctx.strokeStyle = tokens.faint;
      ctx.beginPath();
      ctx.moveTo(0, LOGICAL_H - 40);
      ctx.lineTo(LOGICAL_W, LOGICAL_H - 40);
      ctx.stroke();
    };

    const draw = (blinkPhase: number) => {
      const ctx = canvas.getContext('2d');
      const s = state.current;
      const tokens = s.tokens;
      if (!ctx || !tokens) return;

      ctx.clearRect(0, 0, LOGICAL_W, LOGICAL_H);
      ctx.fillStyle = tokens.bg;
      ctx.fillRect(0, 0, LOGICAL_W, LOGICAL_H);

      drawFloor(ctx, tokens);
      drawHoop(ctx, tokens);
      drawAimLine(ctx, tokens);
      drawBall(ctx, tokens, blinkPhase);

      if (s.flashText) {
        ctx.fillStyle = tokens.accent;
        ctx.font = `bold 20px ${tokens.fontFamily}`;
        ctx.textAlign = 'center';
        ctx.globalAlpha = Math.min(1, s.flashTimer / 20);
        ctx.fillText(s.flashText, HOOP_X, HOOP_Y + 70);
        ctx.globalAlpha = 1;
      }

      ctx.strokeStyle = tokens.faintStrong;
      ctx.strokeRect(0.5, 0.5, LOGICAL_W - 1, LOGICAL_H - 1);
    };

    const loop = (time: number) => {
      const blinkPhase = (time / 1000) % 1;
      if (gate.current.visible && gate.current.active) {
        update();
        draw(blinkPhase);
      }
      rafId.current = requestAnimationFrame(loop);
    };
    rafId.current = requestAnimationFrame(loop);

    return () => {
      if (rafId.current) cancelAnimationFrame(rafId.current);
      if (clockInterval.current) clearInterval(clockInterval.current);
      if (resetTimeout.current) clearTimeout(resetTimeout.current);
      ro.disconnect();
      io.disconnect();
      document.removeEventListener('visibilitychange', onVisibilityChange);
      canvas.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      canvas.removeEventListener('touchstart', onTouchStart);
      canvas.removeEventListener('touchmove', onTouchMove);
      canvas.removeEventListener('touchend', onTouchEnd);
      canvas.removeEventListener('touchcancel', onTouchEnd);
    };
  }, [resize, resetBall, endGame, pointFromClient]);

  return (
    <div ref={wrapperRef} className="hoops-wrapper">
      <div className="scoreboard">
        <div className="stat"><span className="stat-label">SCORE</span><b>{score}</b></div>
        <div className="stat"><span className="stat-label">TIME</span><b>{timeLeft}</b></div>
        <div className="stat"><span className="stat-label">BEST</span><b>{best}</b></div>
      </div>

      <canvas
        ref={canvasRef}
        className="hoops-canvas"
        role="img"
        aria-label="Hoops game. Drag back from the ball and release to shoot, using mouse or touch."
      />

      <div className={`status${gameOver ? ' winner' : ''}`}>
        {status}
        <span className="with-cursor" />
      </div>

      {gameOver && (
        <button className="restart" onClick={restart}>play again</button>
      )}

      <style jsx>{`
        .hoops-wrapper {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1.25rem;
          width: 100%;
        }

        .scoreboard {
          display: flex;
          align-items: center;
          gap: 2.5rem;
          font-family: var(--font-mono);
        }

        .stat {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.3rem;
        }

        .stat-label {
          font-size: 0.7rem;
          opacity: 0.5;
          letter-spacing: 1px;
        }

        .stat b {
          font-size: 1.5rem;
          font-weight: bold;
        }

        .hoops-canvas {
          max-width: 100%;
          touch-action: none;
          cursor: grab;
        }

        .hoops-canvas:active {
          cursor: grabbing;
        }

        .hoops-canvas:focus-visible {
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
