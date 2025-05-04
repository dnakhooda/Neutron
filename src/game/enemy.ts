import { Neutron } from "../neutron/neutron.ts";

enum Direction {
  Left,
  Right,
}

export class Enemy extends Neutron.Platformer {
  // Private Variables
  private direction = Direction.Right;

  constructor(id: number, x: number, y: number) {
    super(`${id}enemy`, x, y, 80, 80, `green`, 10);

    // Setting Variables
    this.setMaxVX(10);
    this.setVXSpeed(4);
    this.setGravityAcc(0.5);
  }

  // Enemy Movement
  doMovement() {
    // Movement
    this.moveX(this.getVX());
    this.doJump(10);

    // Switch Direction If Needed
    switch (this.direction) {
      case Direction.Left:
        this.setVX(this.getVX() - this.getVXSpeed());
        if (this.getPlatformerLeftSelf().length > 0)
          this.direction = Direction.Right;
        break;
      case Direction.Right:
        this.setVX(this.getVX() + this.getVXSpeed());
        if (this.getPlatformerRightSelf().length > 0)
          this.direction = Direction.Left;
        break;
    }
  }

  // Enemy Movement Constraints
  movementConstraints() {
    if (this.getX() < 0) this.setX(0);

    if (this.getY() < 0) this.setY(0);

    if (
      this.getX() + this.getWidth() > Neutron.getRender().getWidth()
    )
      this.setX(Neutron.getRender().getWidth() - this.getWidth());

    if (
      this.getY() + this.getHeight() > Neutron.getRender().getHeight()
    )
      this.setY(Neutron.getRender().getHeight() - this.getHeight());
  }
}
