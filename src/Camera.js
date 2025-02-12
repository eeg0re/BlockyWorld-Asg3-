class Camera {
    constructor(){
        this.eye = new Vector3([0.0, 0.0, 3.0]);
        this.at = new Vector3([0.0, 0.0, -100.0]);
        this.up = new Vector3([0.0, 1.0, 0.0]);
    }

    forward(){
        let d = new Vector3();
        d = this.at.sub(this.eye);
        d.normalize();
        this.eye = this.eye.add(d);
        this.at = this.at.add(d);
    }

    back(){
        let d = new Vector3();
        d = this.at.sub(this.eye);
        d.normalize();
        this.eye = this.eye.sub(d);
        this.at = this.at.sub(d);
    }

    left(){
        let d = new Vector3();
        d = this.at.sub(this.eye);
        d = Vector3.cross(d, this.up);
        d.normalize();
        this.eye = this.eye.sub(d);
        this.at = this.at.sub(d);
    }

    right(){
        let d = new Vector3();
        d = this.at.sub(this.eye);
        d = Vector3.cross(d, this.up);
        d.normalize();
        this.eye = this.eye.add(d);
        this.at = this.at.add(d);
    }
}