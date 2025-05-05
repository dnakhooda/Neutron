import { Neutron } from "../neutron/neutron.ts";

export class Player extends Neutron.Platformer {
  constructor(x: number, y: number) {
    super(`player`, x, y, 80, 80, `#0000ff`, 10);
    this.setMaxVX(10);
    this.setVXSpeed(4);
    this.setGravityAcc(0.5);
  }

  // Player Movement
  doMovement() {
    if (Neutron.getController().getKey(`a`))
      this.setVX(this.getVX() - this.getVXSpeed());

    if (Neutron.getController().getKey(`d`))
      this.setVX(this.getVX() + this.getVXSpeed());

    if (Neutron.getController().getKey(` `)) this.doJump(18);

    this.moveX(this.getVX());
  }

  // Player Movement Constraints
  movementConstraints() {
    if (this.getX() < 0) this.setX(0);

    if (this.getY() < 0) this.setY(0);

    if (this.getX() + this.getWidth() > Neutron.getRender().getWidth())
      this.setX(Neutron.getRender().getWidth() - this.getWidth());

    if (this.getY() + this.getHeight() > Neutron.getRender().getHeight())
      this.setY(Neutron.getRender().getHeight() - this.getHeight());
  }
}
