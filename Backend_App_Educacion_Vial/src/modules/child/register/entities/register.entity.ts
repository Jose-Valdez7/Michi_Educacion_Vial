import { RolesEnum, SexEnum } from '../../../common/enums';

export class Register {
  id: string;
  cedula: string;
  name: string;
  sex: SexEnum[];
  username: string;
  birthDate: Date;
  role: RolesEnum[];
  createdAt: Date;
  updatedAt: Date;
}
