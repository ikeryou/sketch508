import { MyDisplay } from '../core/myDisplay';
import { Parts } from './parts';
import './style.css'

export class Main extends MyDisplay {
  private _parts:Array<Parts> = []
  private _debug: HTMLElement = document.querySelector('.l-debug') as HTMLElement
  // private _oldAng: number = 0
  private _isStart: boolean = false
  private _lastX: number = 0
  private _lastY: number = 0
  private _lastZ: number = 0
  private _shakeThreshold: number = 10

  constructor(opt: any) {
    super(opt);

    const num = 10
    for (let i = 0; i < num; i++) {
      const el = document.createElement('div');
      el.classList.add('l-main-item');
      this.el.appendChild(el);

      this._parts.push(new Parts({
        el: el,
        dispId: i,
      }));
    }

    // センサー取得
    // if(window.DeviceOrientationEvent) {
    //   document.querySelector('.l-btn')?.addEventListener('click', () => {
    //     (window.DeviceOrientationEvent as any).requestPermission().then((r:any) => {
    //       if(r == 'granted') {
    //         window.addEventListener('deviceorientation', (e:DeviceOrientationEvent) => {
    //           const ang = Number(e.alpha)
    //           this._debug.textContent = 'ang ' + Math.abs(ang - this._oldAng)

    //           if(Math.abs(ang - this._oldAng) > 1.2 && !this._isStart) {
    //             this._isStart = true
    //             this._parts.forEach((val) => {
    //               val.start()
    //             })
    //           }

    //           this._oldAng = ang

    //         }, true)
    //         document.querySelector('.l-btn')?.classList.add('s-none')
    //       }

    //     })
    //   })
    // }
    if(window.DeviceMotionEvent) {
      document.querySelector('.l-btn')?.addEventListener('click', () => {
        (window.DeviceMotionEvent as any).requestPermission().then((r:any) => {
          if(r == 'granted') {
            window.addEventListener('devicemotion', (e:DeviceMotionEvent) => {
              const acceleration = e.accelerationIncludingGravity;
              if (!this._isStart && acceleration) {
                const deltaX = Math.abs((acceleration.x || 0) - (this._lastX || 0));
                const deltaY = Math.abs((acceleration.y || 0) - (this._lastY || 0));
                const deltaZ = Math.abs((acceleration.z || 0) - (this._lastZ || 0));

                this._debug.textContent = 'deltaX ' + deltaX + ' deltaY ' + deltaY + ' deltaZ ' + deltaZ

                // 揺れの強さをチェック
                if (deltaX > this._shakeThreshold || deltaY > this._shakeThreshold || deltaZ > this._shakeThreshold) {
                  this._isStart = true
                  this._parts.forEach((val) => {
                    val.start()
                  })
                }

                // 前回の加速度を保存
                this._lastX = acceleration.x || 0;
                this._lastY = acceleration.y || 0;
                this._lastZ = acceleration.z || 0;
              }
            }, true)

            document.querySelector('.l-btn')?.classList.add('s-none')
          }

        })
      })
    }
  }
}


document.querySelectorAll('.l-main').forEach((el) => {
  new Main({
    el: el,
  })
})
