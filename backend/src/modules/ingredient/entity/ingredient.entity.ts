import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  VersionColumn,
} from 'typeorm';

@Entity('ingredients')
export class Ingredient {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  name: string;

  @Column({ length: 20 })
  unit: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  stock: number;

  @VersionColumn()
  version: number;
}
