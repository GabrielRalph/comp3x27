import {SvgPlus, SvgPath, Vector} from "https://www.svg.plus/3.5.js"
let TestTree = {
  keys: [50],
  children: [
    {
      keys: [20, 30],
      children: [
        {keys: [10, 15]},
        {keys: [25]},
        {keys: [40]},
      ]
    },
    {
      keys: [60, 70, 90],
      children: [
        {
          keys: [55],
          children: [
            {keys: [54]},
            {keys: [56]},
          ]
        },
        {keys: [69]},
        {keys: [72, 74, 76, 78]},
        {keys: [75]},
      ]
    }
  ]
}
let BOX_SIZE = 15;
let PADDING_X = 2;
let PADDING_Y = 20;

class BTree extends SvgPlus{
  constructor(json){
    super("svg");
    this.props = {
      viewBox: "-100 -100 200 200"
    }
    this.draw(json);
  }

  draw(node){
    let make = (node) => {
      if (node.children) {
        let bchildren = [];
        for (let child of node.children) {
          let bnode = make(child);
          if (bnode !== null) {
            bchildren.push(bnode);
          }
        }
        node.bchildren = bchildren;
        let parent = new BNode(node);
        if (parent.keys.length == 0) return null;
        this.appendChild(parent);
        return parent;
      }else{
        let bnode = new BNode(node);
        if (bnode.keys.length == 0) return null;
        this.appendChild(bnode);
        return bnode;
      }
    }

    let maxY = 0;

    let place = (bnode, x = 0, y = 0) => {
      maxY = y > maxY ? y : maxY;
      bnode.center = new Vector(x + bnode.width/2, y);
      let xs = x;
      for (let child of bnode.bchildren) {
        console.log(child);
        place(child, xs, y + PADDING_Y + BOX_SIZE);
        xs += child.width;
      }
    }

    this.innerHTML = "";
    let root = make(node);
    console.log(root.width);
    place(root);
    place(root);
    this.props = {viewBox: `0 ${-BOX_SIZE} ${root.width} ${maxY + BOX_SIZE*2}`}

  }


}


class BNode extends SvgPlus{
  constructor(data){
    super("g");
    this.class = "node"
    this.keys = data.keys;
    this.bchildren = data.bchildren;
  }

  draw(){
    this.innerHTML = "";
    let box = this.createChild(SvgPath);
    let crn = new Vector(BOX_SIZE*this.keys.length, BOX_SIZE);
    crn = this.center.sub(crn.div(2));
    let top = new Vector(0, BOX_SIZE);
    let topright = new Vector(BOX_SIZE, BOX_SIZE);
    let right = new Vector(BOX_SIZE, 0);

    let c = crn;
    for (let key of this.keys) {
      box.M(c).L(c.add(top)).L(c.add(topright)).L(c.add(right)).Z();
      let ta = c.add(topright.div(2));
      let fs = BOX_SIZE*0.7/((`${key}`).length*0.5)
      this.createChild('text', {
        x: ta.x,
        y: ta.y + fs/3,
        'font-size': fs,
        style: {

          'text-anchor': 'middle'
        }
      }).innerHTML = key;
      c = c.add(right);
    }
    c = crn.add(top);
    if (this.bchildren) {
      for (let bchild of this.bchildren) {
        let c2 = bchild.center;
        box.M(c).C(c.add(top), c2.sub(top), c2.sub(top.div(2)))
        c = c.add(right)
      }
    }
  }

  set center(center){
    if (center instanceof Vector) {
      this._center = center;
      this.draw();
    }
  }

  get center(){
    if (!this._center) this._center = new Vector()
    return this._center;
  }

  set keys(keys){
    if (Array.isArray(keys)) {
      this._keys = keys;
      this.draw();
    }else{
      this._keys = [];
    }
  }

  get keys(){
    return this._keys;
  }


  set bchildren(bchildren){
    if (Array.isArray(bchildren)) {
      this._bchildren = bchildren;
      this._width = 0;
      for (let child of this.bchildren) {
        child.parent = this;
        this._width += child.width;
      }
      this.draw();
    }else{
      this._bchildren = [];
    }
  }

  get bchildren(){
    return this._bchildren;
  }

  get width(){
    if (this._width) {
      return this._width;
    }
    return this.keys.length * BOX_SIZE + PADDING_X*2;
  }
}

export {BTree, TestTree}
