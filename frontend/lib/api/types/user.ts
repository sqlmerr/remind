import { UUID } from "crypto";

export interface User {
  id: UUID;
  username: string;
  email: string;
}
