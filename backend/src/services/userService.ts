import { IloginPayload, ILoginResponse, IUser } from "../types";
import bcrypt from "bcrypt";
import userRepository from "../repositories/userRepository";
import { Messages } from "../utils/messages";
import { generateToken } from "../utils/common";
import AppError from "../utils/AppError";
import HTTP_STATUS from "../constants/statusCode";

class UserService {
  public async signup(userData: IUser): Promise<IUser> {
    const { password } = userData;
    const hashedPassword = await bcrypt.hash(password, 10);
    if (!hashedPassword) {
      throw new AppError(Messages.BAD_REQUEST, HTTP_STATUS.BAD_REQUEST);
    }
    userData.password = hashedPassword;
    const user = await userRepository.createUser(userData);
    if (!user) {
      throw new AppError(Messages.USER_NOT_CREATED, HTTP_STATUS.BAD_REQUEST);
    }
    return user;
  }

  public async login(payload: IloginPayload): Promise<ILoginResponse> {
    const findUser = await userRepository.findUserByEmail(payload.email);
    if (!findUser) {
      throw new AppError(Messages.NOT_FOUND, HTTP_STATUS.NOT_FOUND);
    }
    const isPasswordMatched = await bcrypt.compare(
      payload.password,
      findUser.password
    );
    if (!isPasswordMatched) {
      throw new AppError(Messages.INVALID_CREDENTIALS, 401);
    }
    const { refreshToken, accessToken } = await generateToken(findUser);
    return {
      user: findUser,
      accessToken,
      refreshToken,
    };
  }

  
}
export default new UserService();
