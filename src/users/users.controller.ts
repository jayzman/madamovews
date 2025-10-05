import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from "@nestjs/common"
import { UsersService } from "./users.service"
import { CreateUserDto } from "./dto/create-user.dto"
import { UpdateUserDto } from "./dto/update-user.dto"
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard"
import { RolesGuard } from "../auth/guards/roles.guard"
import { Roles } from "../auth/decorators/roles.decorator"
import { Role } from "@prisma/client"

@Controller("users")
// @UseGuards(JwtAuthGuard, RolesGuard) // Ensure guards are applied
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @Roles(Role.ADMIN, Role.GESTIONNAIRE)
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Post('/invite')
  @Roles(Role.ADMIN, Role.GESTIONNAIRE)
  invite(@Body() createUserDto: CreateUserDto) {
    return this.usersService.inviteUser(createUserDto);
  }

  @Get()
  @Roles(Role.ADMIN, Role.GESTIONNAIRE, Role.SUPPORT)
  findAll() {
    return this.usersService.findAll()
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.GESTIONNAIRE, Role.SUPPORT)
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(+id);
  }

  @Patch(":id")
  @Roles(Role.ADMIN, Role.GESTIONNAIRE)
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(+id, updateUserDto)
  }

  @Delete(':id')
  @Roles(Role.ADMIN, Role.GESTIONNAIRE)
  remove(@Param('id') id: string) {
    return this.usersService.remove(+id);
  }
}
