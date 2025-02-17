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

    /* 
--------- movement psuedocode ------------
--- up will have to be taken into account if we give user control of up/down camera movement

    ---- rotate camera ----
    rotate - {
        let d = new Vector3();
        d = at.sub(eye);
        d.normalize();
        let r = sqrt (d.x ^2 + d.z ^2);
        let theta = atan2(d.z, d.x);
        theta += 0.1; // probably in radians, so adjust accordingly 
        let newx = r * cos(theta);
        let newz = r * sin(theta);
        d = new Vector3([newx, d.y, newz]);
        at = eye.add(d);
    }
*/
    rotateRight(degrees = 1){
        let d = new Vector3();
        d = this.at.sub(this.eye);
        d.elements[1] = 0;
        d.normalize();
        let r = d.magnitude();
        let theta = Math.atan2(d.elements[0], d.elements[2]); // let theta = atan2(d.z, d.x);
        let radians = -degrees * (Math.PI / 180);
        theta = theta + radians;
        let newx = r * Math.sin(theta); 
        let newz = r * Math.cos(theta); 
        d = new Vector3([newx, d.elements[1], newz]); 
        this.at = this.eye.add(d);
        console.log(this.at);
    }

    rotateLeft(degrees = 5){
        let d = new Vector3();
        d = this.at.sub(this.eye);
        d.elements[1] = 0;
        d.normalize();
        let r = d.magnitude();
        let theta = Math.atan2(d.elements[2], d.elements[0]); 
        let radians = -degrees * (Math.PI / 180);
        theta = theta + radians;
        let newx = r * Math.cos(theta); 
        let newz = r * Math.sin(theta); 
        d = new Vector3([newx, d.elements[1], newz]); 
        this.at = this.eye.add(d);
        console.log(this.at);
    }
}