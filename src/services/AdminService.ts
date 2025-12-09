import { getCurrentUser } from "./AuthService"

export class AdminService {
    public static async isAdmin():Promise<boolean> {
    const auther =await getCurrentUser();
    if(!auther)
    {
      return false;
    }
    else if(auther.role === "admin")
      return true;
    return false;
  }
}
export const isAdmin = AdminService.isAdmin.bind(AdminService)