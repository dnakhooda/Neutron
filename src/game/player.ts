import { Neutron } from "../neutron/Neutron.ts";

export class Player extends Neutron.Sprites.Platformer {
  constructor(x: number, y: number) {
    super(`player`, x, y, 80, 80, `blue`, 10);
    this.setMaxVX = 10;
    this.setVXSpeed = 4;
    this.setGravityAcc = 0.5;
  }

  // Player Movement
  doMovement() {
    if (Neutron.getController().getKey(`a`))
      this.setVX = this.getVX - this.getVXSpeed;

    if (Neutron.getController().getKey(`d`))
      this.setVX = this.getVX + this.getVXSpeed;

    if (Neutron.getController().getKey(` `)) this.doJump(18);

    this.moveX(this.getVX);
  }

  // Player Movement Constraints
  movementConstraints() {
    if (this.getMovement.getX < 0) this.getMovement.setX = 0;

    if (this.getMovement.getY < 0) this.getMovement.setY = 0;

    if (
      this.getMovement.getX + this.getDimensions.getWidth >
      Neutron.getRender().getWidth
    )
      this.getMovement.setX =
        Neutron.getRender().getWidth - this.getDimensions.getWidth;

    if (
      this.getMovement.getY + this.getDimensions.getHeight >
      Neutron.getRender().getHeight
    )
      this.getMovement.setY =
        Neutron.getRender().getHeight - this.getDimensions.getHeight;
  }
}
