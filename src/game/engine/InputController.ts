/**
 * The Lost Meridian - Input Controller
 * Handles Keyboard, Pointer Lock, Mouse Look, and Touch Inputs.
 */

export class InputController {
  // Movement keys
  public moveForward = false;
  public moveBackward = false;
  public moveLeft = false;
  public moveRight = false;
  public isSprinting = false;
  public isCrouching = false;
  public jumpRequested = false;

  // Actions
  public interactRequested = false;
  public torchToggleRequested = false;
  public lensModeToggleRequested = false;
  public journalToggleRequested = false;
  public mapToggleRequested = false;
  public pauseToggleRequested = false;
  public styleToggleRequested = false;
  public cameraViewToggleRequested = false;
  public photoModeToggleRequested = false;
  public fishingRequested = false;
  public loreInspectRequested = false;
  public rescueRequested = false;
  public qaAuditToggleRequested = false;

  // Mobile Virtual Joystick Analog Movement
  public virtualMoveX = 0;
  public virtualMoveY = 0;

  // Mouse / Pointer Lock
  public isPointerLocked = false;
  public isMouseDown = false;
  public mouseDeltaX = 0;
  public mouseDeltaY = 0;
  private lastMouseX = 0;
  private lastMouseY = 0;
  private mouseDownStartX = 0;
  private mouseDownStartY = 0;

  // Virtual Joystick / Touch
  public isTouchDevice = false;
  private lastTouchX = 0;
  private lastTouchY = 0;
  private isTouching = false;

  private domElement: HTMLElement | null = null;
  private boundKeyDown: (e: KeyboardEvent) => void;
  private boundKeyUp: (e: KeyboardEvent) => void;
  private boundMouseMove: (e: MouseEvent) => void;
  private boundMouseDown: (e: MouseEvent) => void;
  private boundMouseUp: (e: MouseEvent) => void;
  private boundTouchStart: (e: TouchEvent) => void;
  private boundTouchMove: (e: TouchEvent) => void;
  private boundTouchEnd: () => void;
  private boundPointerLockChange: () => void;
  private boundPointerLockError: () => void;

  constructor() {
    this.boundKeyDown = this.onKeyDown.bind(this);
    this.boundKeyUp = this.onKeyUp.bind(this);
    this.boundMouseMove = this.onMouseMove.bind(this);
    this.boundMouseDown = this.onMouseDown.bind(this);
    this.boundMouseUp = this.onMouseUp.bind(this);
    this.boundTouchStart = this.onTouchStart.bind(this);
    this.boundTouchMove = this.onTouchMove.bind(this);
    this.boundTouchEnd = this.onTouchEnd.bind(this);
    this.boundPointerLockChange = this.onPointerLockChange.bind(this);
    this.boundPointerLockError = this.onPointerLockError.bind(this);
  }

  public attach(element: HTMLElement) {
    this.domElement = element;
    window.addEventListener('keydown', this.boundKeyDown);
    window.addEventListener('keyup', this.boundKeyUp);
    document.addEventListener('mousemove', this.boundMouseMove);
    document.addEventListener('mousedown', this.boundMouseDown);
    document.addEventListener('mouseup', this.boundMouseUp);
    document.addEventListener('pointerlockchange', this.boundPointerLockChange);
    document.addEventListener('pointerlockerror', this.boundPointerLockError);

    // Check touch support
    this.isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  }

  public detach() {
    window.removeEventListener('keydown', this.boundKeyDown);
    window.removeEventListener('keyup', this.boundKeyUp);
    document.removeEventListener('mousemove', this.boundMouseMove);
    document.removeEventListener('mousedown', this.boundMouseDown);
    document.removeEventListener('mouseup', this.boundMouseUp);
    document.removeEventListener('pointerlockchange', this.boundPointerLockChange);
    document.removeEventListener('pointerlockerror', this.boundPointerLockError);
  }

  public requestPointerLock() {
    if (this.domElement && !this.isPointerLocked) {
      try {
        const promise = this.domElement.requestPointerLock() as any;
        if (promise && typeof promise.catch === 'function') {
          promise.catch(() => {
            // Silently ignore rejected pointer lock requests when not in direct user gesture
          });
        }
      } catch (e) {
        // Silently catch synchronous security/gesture errors
      }
    }
  }

  public exitPointerLock() {
    if (document.pointerLockElement) {
      try {
        document.exitPointerLock();
      } catch (e) {
        // Ignore
      }
    }
  }

  private onPointerLockChange() {
    this.isPointerLocked = document.pointerLockElement === this.domElement;
  }

  private onPointerLockError() {
    // Handle error quietly without crashing the engine
    this.isPointerLocked = false;
  }

  private onMouseDown(e: MouseEvent) {
    // If clicking a UI button or overlay, let DOM event proceed without capturing 3D input
    if ((e.target as HTMLElement)?.closest('button, a, input, select, textarea, [data-interactive="true"]')) {
      return;
    }
    this.isMouseDown = true;
    this.lastMouseX = e.clientX;
    this.lastMouseY = e.clientY;
    this.mouseDownStartX = e.clientX;
    this.mouseDownStartY = e.clientY;
  }

  private onMouseUp(e: MouseEvent) {
    this.isMouseDown = false;
    // Check if this was a deliberate stationary click (not a camera drag)
    if (e.button === 0) {
      const movedDist = Math.hypot(e.clientX - this.mouseDownStartX, e.clientY - this.mouseDownStartY);
      if (movedDist < 6) {
        if (!(e.target as HTMLElement)?.closest('button, a, input, select, textarea, [data-interactive="true"]')) {
          this.interactRequested = true;
        }
      }
    }
  }

  private onMouseMove(e: MouseEvent) {
    if (this.isPointerLocked) {
      this.mouseDeltaX += e.movementX;
      this.mouseDeltaY += e.movementY;
    } else if (this.isMouseDown) {
      const dx = e.clientX - this.lastMouseX;
      const dy = e.clientY - this.lastMouseY;
      this.lastMouseX = e.clientX;
      this.lastMouseY = e.clientY;
      this.mouseDeltaX += dx;
      this.mouseDeltaY += dy;
    }
  }

  private onTouchStart(e: TouchEvent) {
    if (e.touches.length > 0) {
      this.isTouching = true;
      this.lastTouchX = e.touches[0].clientX;
      this.lastTouchY = e.touches[0].clientY;
    }
  }

  private onTouchMove(e: TouchEvent) {
    if (this.isTouching && e.touches.length > 0) {
      const dx = e.touches[0].clientX - this.lastTouchX;
      const dy = e.touches[0].clientY - this.lastTouchY;
      this.lastTouchX = e.touches[0].clientX;
      this.lastTouchY = e.touches[0].clientY;
      this.mouseDeltaX += dx * 1.5;
      this.mouseDeltaY += dy * 1.5;
    }
  }

  private onTouchEnd() {
    this.isTouching = false;
  }

  private onKeyDown(e: KeyboardEvent) {
    // If typing in an input field, do not capture
    if ((e.target as HTMLElement)?.tagName === 'INPUT') return;

    switch (e.code) {
      case 'KeyW':
      case 'ArrowUp':
        this.moveForward = true;
        break;
      case 'KeyS':
      case 'ArrowDown':
        this.moveBackward = true;
        break;
      case 'KeyA':
      case 'ArrowLeft':
        this.moveLeft = true;
        break;
      case 'KeyD':
      case 'ArrowRight':
        this.moveRight = true;
        break;
      case 'ShiftLeft':
      case 'ShiftRight':
        this.isSprinting = true;
        break;
      case 'KeyC':
        this.cameraViewToggleRequested = true;
        break;
      case 'ControlLeft':
        this.isCrouching = !this.isCrouching; // Toggle crouch
        break;
      case 'Space':
        this.jumpRequested = true;
        break;
      case 'KeyE':
        this.interactRequested = true;
        break;
      case 'KeyT':
        this.torchToggleRequested = true;
        break;
      case 'KeyV':
        this.lensModeToggleRequested = true;
        break;
      case 'KeyP':
        this.photoModeToggleRequested = true;
        break;
      case 'KeyF':
        this.fishingRequested = true;
        break;
      case 'KeyL':
        this.loreInspectRequested = true;
        break;
      case 'Tab':
      case 'KeyJ':
      case 'KeyI':
        e.preventDefault();
        this.journalToggleRequested = true;
        break;
      case 'KeyM':
        this.mapToggleRequested = true;
        break;
      case 'Escape':
        this.pauseToggleRequested = true;
        break;
      case 'F8':
      case 'KeyU':
        this.rescueRequested = true;
        break;
      case 'KeyQ':
        this.qaAuditToggleRequested = true;
        break;
    }
  }

  private onKeyUp(e: KeyboardEvent) {
    switch (e.code) {
      case 'KeyW':
      case 'ArrowUp':
        this.moveForward = false;
        break;
      case 'KeyS':
      case 'ArrowDown':
        this.moveBackward = false;
        break;
      case 'KeyA':
      case 'ArrowLeft':
        this.moveLeft = false;
        break;
      case 'KeyD':
      case 'ArrowRight':
        this.moveRight = false;
        break;
      case 'ShiftLeft':
      case 'ShiftRight':
        this.isSprinting = false;
        break;
    }
  }

  private prevGamepadButtons: boolean[] = [];

  public updateGamepad(delta: number) {
    if (typeof navigator === 'undefined' || !navigator.getGamepads) return;
    const gamepads = navigator.getGamepads();
    if (!gamepads) return;

    for (let i = 0; i < gamepads.length; i++) {
      const gp = gamepads[i];
      if (!gp || !gp.connected) continue;

      // Left Stick Movement (Axes 0, 1 with 0.15 deadzone)
      const lx = Math.abs(gp.axes[0]) > 0.15 ? gp.axes[0] : 0;
      const ly = Math.abs(gp.axes[1]) > 0.15 ? -gp.axes[1] : 0;
      if (Math.abs(lx) > 0.15 || Math.abs(ly) > 0.15) {
        this.virtualMoveX = lx;
        this.virtualMoveY = ly;
        this.moveForward = ly > 0.25;
        this.moveBackward = ly < -0.25;
        this.moveRight = lx > 0.25;
        this.moveLeft = lx < -0.25;
      }

      // Right Stick Look (Axes 2, 3 with 0.15 deadzone)
      const rx = Math.abs(gp.axes[2]) > 0.15 ? gp.axes[2] : 0;
      const ry = Math.abs(gp.axes[3]) > 0.15 ? gp.axes[3] : 0;
      if (rx !== 0 || ry !== 0) {
        this.mouseDeltaX += rx * 14.0;
        this.mouseDeltaY += ry * 14.0;
      }

      // Button A (0): Jump
      if (gp.buttons[0]?.pressed && !this.prevGamepadButtons[0]) {
        this.jumpRequested = true;
      }

      // Button B (1): Crouch
      if (gp.buttons[1]?.pressed && !this.prevGamepadButtons[1]) {
        this.isCrouching = !this.isCrouching;
      }

      // Button X (2): Interact [E]
      if (gp.buttons[2]?.pressed && !this.prevGamepadButtons[2]) {
        this.interactRequested = true;
      }

      // Button Y (3): Torch Toggle [F]
      if (gp.buttons[3]?.pressed && !this.prevGamepadButtons[3]) {
        this.torchToggleRequested = true;
      }

      // Left Bumper / L3 (4, 10): Sprint
      if (gp.buttons[4]?.pressed || gp.buttons[10]?.pressed) {
        this.isSprinting = true;
      }

      // Select / Back (8): Journal
      if (gp.buttons[8]?.pressed && !this.prevGamepadButtons[8]) {
        this.journalToggleRequested = true;
      }

      // Start / Menu (9): Pause
      if (gp.buttons[9]?.pressed && !this.prevGamepadButtons[9]) {
        this.pauseToggleRequested = true;
      }

      // Store button states
      for (let b = 0; b < gp.buttons.length; b++) {
        this.prevGamepadButtons[b] = gp.buttons[b].pressed;
      }

      break; // Only read primary active gamepad
    }
  }

  /**
   * Consume and reset one-shot frame triggers
   */
  public consumeMouseDelta(): { x: number; y: number } {
    const delta = { x: this.mouseDeltaX, y: this.mouseDeltaY };
    this.mouseDeltaX = 0;
    this.mouseDeltaY = 0;
    return delta;
  }

  public consumeInteract(): boolean {
    const val = this.interactRequested;
    this.interactRequested = false;
    return val;
  }

  public consumeTorch(): boolean {
    const val = this.torchToggleRequested;
    this.torchToggleRequested = false;
    return val;
  }

  public consumeLensMode(): boolean {
    const val = this.lensModeToggleRequested;
    this.lensModeToggleRequested = false;
    return val;
  }

  public consumePhotoMode(): boolean {
    const val = this.photoModeToggleRequested;
    this.photoModeToggleRequested = false;
    return val;
  }

  public consumeJournal(): boolean {
    const val = this.journalToggleRequested;
    this.journalToggleRequested = false;
    return val;
  }

  public consumeMap(): boolean {
    const val = this.mapToggleRequested;
    this.mapToggleRequested = false;
    return val;
  }

  public consumePause(): boolean {
    const val = this.pauseToggleRequested;
    this.pauseToggleRequested = false;
    return val;
  }

  public consumeStyleToggle(): boolean {
    const val = this.styleToggleRequested;
    this.styleToggleRequested = false;
    return val;
  }

  public consumeJump(): boolean {
    const val = this.jumpRequested;
    this.jumpRequested = false;
    return val;
  }

  public consumeCameraViewToggle(): boolean {
    const val = this.cameraViewToggleRequested;
    this.cameraViewToggleRequested = false;
    return val;
  }

  public consumeFishing(): boolean {
    const val = this.fishingRequested;
    this.fishingRequested = false;
    return val;
  }

  public consumeRescue(): boolean {
    const val = this.rescueRequested;
    this.rescueRequested = false;
    return val;
  }

  public consumeQAAudit(): boolean {
    const val = this.qaAuditToggleRequested;
    this.qaAuditToggleRequested = false;
    return val;
  }

  /**
   * Mobile touch methods
   */
  public setVirtualJoystick(x: number, y: number) {
    this.virtualMoveX = Math.max(-1, Math.min(1, x));
    this.virtualMoveY = Math.max(-1, Math.min(1, y));
  }

  public addTouchLookDelta(dx: number, dy: number) {
    this.mouseDeltaX += dx;
    this.mouseDeltaY += dy;
  }

  public triggerHapticRumble(duration = 200, strong = 0.5) {
    if ('getGamepads' in navigator) {
      const gamepads = navigator.getGamepads();
      for (const gp of gamepads) {
        if (gp && gp.vibrationActuator) {
          try {
            gp.vibrationActuator.playEffect('dual-rumble', {
              startDelay: 0,
              duration,
              weakMagnitude: strong * 0.5,
              strongMagnitude: strong,
            });
          } catch {
            // Ignore unallowed vibration effects
          }
        }
      }
    }
  }

  public pollGamepad() {
    if (!('getGamepads' in navigator)) return;
    const gamepads = navigator.getGamepads();
    const gp = gamepads[0] || gamepads[1];
    if (!gp) return;

    // Analog sticks
    const lx = gp.axes[0] || 0;
    const ly = gp.axes[1] || 0;
    const rx = gp.axes[2] || 0;
    const ry = gp.axes[3] || 0;

    const deadzone = 0.18;
    if (Math.abs(lx) > deadzone || Math.abs(ly) > deadzone) {
      this.virtualMoveX = Math.abs(lx) > deadzone ? lx : 0;
      this.virtualMoveY = Math.abs(ly) > deadzone ? -ly : 0;
      this.moveForward = ly < -deadzone;
      this.moveBackward = ly > deadzone;
      this.moveLeft = lx < -deadzone;
      this.moveRight = lx > deadzone;
    }

    if (Math.abs(rx) > deadzone || Math.abs(ry) > deadzone) {
      this.mouseDeltaX += (Math.abs(rx) > deadzone ? rx : 0) * 8;
      this.mouseDeltaY += (Math.abs(ry) > deadzone ? ry : 0) * 8;
    }

    // Buttons: A (0) = Interact, B (1) = Jump, X (2) = Journal, Y (3) = Torch
    if (gp.buttons[0]?.pressed) this.interactRequested = true;
    if (gp.buttons[1]?.pressed) this.jumpRequested = true;
    if (gp.buttons[2]?.pressed) this.journalToggleRequested = true;
    if (gp.buttons[3]?.pressed) this.torchToggleRequested = true;
  }

  public triggerInteract() {
    this.interactRequested = true;
  }

  public triggerJump() {
    this.jumpRequested = true;
  }

  public triggerTorch() {
    this.torchToggleRequested = true;
  }

  public triggerLensToggle() {
    this.lensModeToggleRequested = true;
  }

  public triggerSprintToggle() {
    this.isSprinting = !this.isSprinting;
  }

  public triggerJournal() {
    this.journalToggleRequested = true;
  }

  public triggerMap() {
    this.mapToggleRequested = true;
  }

  public triggerPause() {
    this.pauseToggleRequested = true;
  }

  public triggerFishing() {
    this.fishingRequested = true;
  }

  public triggerStyleToggle() {
    this.styleToggleRequested = true;
  }

  public triggerCameraViewToggle() {
    this.cameraViewToggleRequested = true;
  }
}
