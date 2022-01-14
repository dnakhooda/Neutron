import { Neutron } from "../Neutron/Neutron.js";
export class Player extends Neutron.Sprites.Sprite {
    constructor(x, y) {
        super(`player`, x, y, 80, 80, `blue`, 10);
        // Setting Variables
        this.speed = 10;
    }
    // Player Movement
    doMovement() {
        if (Neutron.getController().getKey(`a`))
            this.getMovement.setX = this.getMovement.getX - this.speed;
        if (Neutron.getController().getKey(`d`))
            this.getMovement.setX = this.getMovement.getX + this.speed;
        if (Neutron.getController().getKey(`w`))
            this.getMovement.setY = this.getMovement.getY - this.speed;
        if (Neutron.getController().getKey(`s`))
            this.getMovement.setY = this.getMovement.getY + this.speed;
    }
    // Player Movement Constraints
    movementConstraints() {
        if (this.getMovement.getX < 0)
            this.getMovement.setX = 0;
        if (this.getMovement.getY < 0)
            this.getMovement.setY = 0;
        if (this.getMovement.getX + this.getDimensions.getWidth > Neutron.getRender().getWidth)
            this.getMovement.setX = Neutron.getRender().getWidth - this.getDimensions.getWidth;
        if (this.getMovement.getY + this.getDimensions.getHeight > Neutron.getRender().getHeight)
            this.getMovement.setY = Neutron.getRender().getHeight - this.getDimensions.getHeight;
    }
    // Setting Getters and Setters
    get getSpeed() { return this.speed; }
}
