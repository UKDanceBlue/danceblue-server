import { IsEmail } from "class-validator";
import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class User {
    @PrimaryGeneratedColumn("identity")
      id!: number;

    @Column("uuid", { generated: "uuid", unique: true, nullable: false })
      userId!: string;

    @Column("text")
      firstName!: string;

    @Column("text")
      lastName!: string;

    @Column("text")
    @IsEmail()
      email!: string;

    @Column("text")
      upn!: string;
}
