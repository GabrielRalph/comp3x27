import {SvgPlus, Vector} from "https://www.svg.plus/3.5.js"

class Color{
  constructor(r, g, b, a){
    this.r = r;
    this.g = g;
    this.b = b;
    this.a = a;
  }

  static HSL(h,s,l,a = 255) {
      // Must be fractions of 1
   s /= 100;
   l /= 100;

   let c = (1 - Math.abs(2 * l - 1)) * s,
       x = c * (1 - Math.abs((h / 60) % 2 - 1)),
       m = l - c/2,
       r = 0,
       g = 0,
       b = 0;

    if (0 <= h && h < 60) {
      r = c; g = x; b = 0;
    } else if (60 <= h && h < 120) {
      r = x; g = c; b = 0;
    } else if (120 <= h && h < 180) {
      r = 0; g = c; b = x;
    } else if (180 <= h && h < 240) {
      r = 0; g = x; b = c;
    } else if (240 <= h && h < 300) {
      r = x; g = 0; b = c;
    } else if (300 <= h && h < 360) {
      r = c; g = 0; b = x;
    }
    r = Math.round((r + m) * 255);
    g = Math.round((g + m) * 255);
    b = Math.round((b + m) * 255);

  return new Color(r,g,b,a)
  }
}

class FunctionImage extends SvgPlus{
  constructor(){
    super("div")
    this.input = this.createChild("input")
    this.update = this.createChild("span")
    this.update.innerHTML = "UPDATE"
    this.class = "function-image"
    this.update.onclick = () => {
      this.fs = this.input.value
    }

    this.canvas = this.createChild("canvas")
    this.size = 64
    this.canvas.props = {
      width: this.size,
      height: this.size
    }
    let ctx = this.canvas.getContext("2d");
    this.pixel = ctx.createImageData(1,1); // only do this once per page
    this.fs = "z = Math.sin(x*y*ax)"
    this.input.value = this.fs
    this.f = (x, y, ax, ay, az) => {
      return this.runF(this.fs, x, y, ax, ay, az)
    }
    this.a = 255;
    this.az = 1;
    this.ay = 1;
    this.ax = 1;

    this.i = 0;
    this.j = 0;

  }

  start(){
    this.running = true


    let next = () => {
      // this.j = (this.j + 1) % this.size;

       for (var i = 0; i < this.size; i++){
        for (var j = 0; j < this.size; j++){
          this.setPixel(i, j)
        }
      }
      if (this.running){
        window.requestAnimationFrame(next);
      }
    }
    next();
  }

  runF(f, x, y, ax, az, ay){
    let z = 0;
    eval(f)
    return z
  }

  stop(){
    this.running = false;
  }

  setPixelColor(x, y, color){
    this.pixel.data[0] = color.r;
    this.pixel.data[1] = color.g;
    this.pixel.data[2] = color.b;
    this.pixel.data[3] = color.a;
    let ctx = this.canvas.getContext("2d");
    ctx.putImageData(this.pixel, x, y);
  }

  hue(z){
    let step = (z) => {
      return 1/ ( 1 + Math.pow(2.71, -z/0.1))
    }
    if (z > 0.55){
      let n = 1.44*(z - 0.55)/0.45 -0.44;
      return step(n)*120 + 180;
    }else{
      let n = 2*z/0.55 - 1;
      return 60 + step(n)*120;
    }
  }

  setPixel(x, y, ax = this.ax, ay = this.ay, az = this.az){
    if (this.f instanceof Function){
      let color = Color.HSL(this.hue(this.f(x, y, ax, ay, az)), 100, 50)
      this.setPixelColor(x, y, color)
    }
  }
}
export {FunctionImage}
