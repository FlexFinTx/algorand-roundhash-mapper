import { Entity, Column, BaseEntity, PrimaryColumn } from 'typeorm';

@Entity()
export class RoundHash extends BaseEntity {
  @PrimaryColumn()
  hash: string;

  @Column()
  round: number;
}
