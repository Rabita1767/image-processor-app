import UserModel from "../models/userModel";
import { IUser } from "../types";
class UserRepository {
  public async createUser(userData: IUser): Promise<IUser> {
    const user = new UserModel({
      userName: userData.userName,
      email: userData.email,
      password: userData.password,
    });
    await user.save();
    return user;
  }
  public async findUserByEmail(email: string): Promise<IUser | null> {
    return await UserModel.findOne({ email: email });
  }
  public async findUserById(userId: string) {
    return await UserModel.findById({ _id: userId });
  }
}
export default new UserRepository();
