import { Neutron } from "../Neutron/Neutron.js";
var Direction;
(function (Direction) {
    Direction[Direction["Left"] = 0] = "Left";
    Direction[Direction["Right"] = 1] = "Right";
})(Direction || (Direction = {}));
export class Enemy extends Neutron.Sprites.Platformer {
    constructor(id, x, y) {
        super(`${id}enemy`, x, y, 80, 80, `green`, 10);
        // Private Variables
        this.direction = Direction.Right;
        // Setting Variables
        this.setMaxVX = 10;
        this.setVXSpeed = 4;
        this.setGravityAcc = 0.5;
    }
    // Enemy Movement
    doMovement() {
        // Movement
        this.moveX(this.getVX);
        this.doJump(10);
        // Switch Direction If Needed
        switch (this.direction) {
            case Direction.Left:
                this.setVX = this.getVX - this.getVXSpeed;
                if (this.getPlatformerLeftSelf().length > 0)
                    this.direction = Direction.Right;
                break;
            case Direction.Right:
                this.setVX = this.getVX + this.getVXSpeed;
                if (this.getPlatformerRightSelf().length > 0)
                    this.direction = Direction.Left;
                break;
        }
    }
    // Enemy Movement Constraints
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
}
