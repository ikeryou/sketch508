import { CatmullRomCurve3, TubeGeometry, Vector3 } from 'three';
import { MyDisplay } from '../core/myDisplay';
import { DisplayConstructor } from '../libs/display';
import { Util } from '../libs/util';
import { Func } from '../core/func';
import { Tween } from '../core/tween';
import { Segment } from './segment';

export class Parts extends MyDisplay {

  private _text: Array<string> = [
   'After-a-long-day,-a-cold-beer-calls.',
   'Nothing-beats-the-first-sip-of-beer.',
   'I-crave-the-refreshing-taste-of-beer.',
   'The-malt-aroma-makes-my-heart-happy.',
   'A-chilled-beer-is-all-I-need-now.',
   'Work’s-done,-it’s-time-for-a-beer.',
   'The-fizz-and-malt-are-calling-me.',
   'A-cold-beer-feels-like-pure-reward.',
   'Nothing-refreshes-like-a-cold-beer.',
   'Today-ends-best-with-a-perfect-beer.',
  ]

  private _segment:Array<Segment> = [];
  private _segmentDummy:Array<HTMLElement> = [];
  private _route: Array<Vector3> = []
  private _now: number = 0
  private _isStart: boolean = false

  constructor(opt: DisplayConstructor) {
    super(opt);

    const t = this._text[(opt.dispId || 0) % this._text.length]
    const tList = t.split('')

    const num = ~~(t.length * 0.35)
    const start = Util.randomInt(0, tList.length - 1 - num)
    const end = start + num

    tList.forEach((t,i) => {
      const el = document.createElement('span');
      el.textContent = t;
      this.el.appendChild(el);

      if(i >= start && i < end) {
        el.classList.add('-segment-dummy')
        this._segmentDummy.push(el)

        const el2 = document.createElement('span')
        el2.textContent = t
        this.el.appendChild(el2)
        el2.classList.add('-segment')

        const seg = new Segment({
          el: el2,
        })
        this._segment.push(seg);
      }
    })
    this._segment.reverse()
    this._segmentDummy.reverse()

    this._makeRoute()
  }

  public start(): void {
    this._isStart = true
  }

  protected _makeRoute(): void {
    const arr: Vector3[] = []
    
    const sw = Func.sw()
    const sh = Func.sh()

    const defX = 0

    arr.push(new Vector3(defX, 0, 0))
    arr.push(new Vector3(defX, 0, 0))

    if(1) {
      const xRange = sw * Util.random(0.1, 0.25) * (Util.hit(2) ? 1 : -1)
      const yIt = sh * 0.25 * (Util.hit(2) ? 1 : -1)

      arr.push(new Vector3(defX + 0, yIt, 0))
      arr.push(new Vector3(defX + xRange, yIt * 2, 0))
      arr.push(new Vector3(defX + 0, yIt * 3, 0))
      arr.push(new Vector3(defX + sw * 0.25, yIt * 5, 0))
    } else {
      const yRange = sw * Util.random(0.01, 0.05) * (Util.hit(2) ? 1 : -1)
      const xIt = sw * 0.25

      arr.push(new Vector3(defX + xIt, yRange, 0))
      arr.push(new Vector3(defX + xIt * 2, -yRange, 0))
      arr.push(new Vector3(defX + xIt * 3, yRange * 2, 0))
      arr.push(new Vector3(defX + xIt * 5, -yRange, 0))
    }

    const curve:CatmullRomCurve3 = new CatmullRomCurve3(arr, false);
    const tube = new TubeGeometry(curve, 128, 1, 3, false);
    this._route = tube.parameters.path.getPoints(128 * 2)
  }


  // 更新
  protected _update(): void {
    super._update();

    if(this._now == -1) return

    let tgPos = this._route[this._now].clone()
    const tgX = this.getOffset(this._segmentDummy[0]).x
    tgPos.x += tgX

    this._segment.forEach((val,i) => {
      let x = 0;
      let y = 0;
      let dx;
      let dy;
      let prev;

      if(i == 0) {
        dx = tgPos.x - val.getPos().x;
        dy = tgPos.y - val.getPos().y;
      } else {
        prev = this._segment[i - 1];
        dx = prev.getPos().x - val.getPos().x;
        dy = prev.getPos().y - val.getPos().y;
      }

      const radian = Math.atan2(dy, dx); // ラジアン
      val.setRot(Util.degree(radian)); // 度に変換

      const w = val.getPin().x - val.getPos().x
      const h = val.getPin().y - val.getPos().y

      if(i == 0) {
        x = tgPos.x - w;
        y = tgPos.y - h;
      } else {
        if(prev != undefined) {
          x = prev.getPos().x - w;
          y = prev.getPos().y - h;
        }
      }

      // 要素に反映
      const r = (this._isStart && this._now > 10) ? 1.5 : 0
      Tween.set(val.el, {
        x:x + Util.range(r),
        y:y + Util.range(r),
        rotationZ:val.getRot()
      })

      val.setPos(x, y);
    })

    if(this._isStart) this._now += 2
    if(this._now >= this._route.length) {
      this._now = -1
    }
  }
}

