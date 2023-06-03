import { inject } from '@loopback/core';
import {
  Credentials,
  User,
  TokenServiceBindings,
  MyUserService,
  UserServiceBindings,
  UserRepository,
} from '@loopback/authentication-jwt';
import { authenticate, TokenService } from '@loopback/authentication';
import {SecurityBindings, securityId, UserProfile} from '@loopback/security';

import {
    Count,
    CountSchema,
    Filter,
    FilterExcludingWhere,
    model,
    property,
    repository,
    Where,
} from '@loopback/repository';
import {
    post,
    param,
    get,
    getModelSchemaRef,
    patch,
    put,
    del,
    requestBody,
    response,
    SchemaObject,
} from '@loopback/rest';

import { genSalt, hash } from 'bcryptjs';
import _ from 'lodash';


const PASSWORD_LENGTH: number = 8;

@model()
export class NewUserRequest extends User {
  @property({
    type: 'string',
    required: true,
    minLength: PASSWORD_LENGTH,
  })
  password: string;
}

const CredentialsSchema: SchemaObject = {
  type: 'object',
  required: ['email', 'password'],
  properties: {
    email: {
      type: 'string',
      format: 'email',
    },
    password: {
      type: 'string',
      minLength: PASSWORD_LENGTH,
    },
  },
};

export const CredentialsRequestBody = {
  description: 'The input of login function',
  required: true,
  content: {
    'application/json': {schema: CredentialsSchema},
  },
};

@authenticate('jwt')
export class UserController {
  constructor(
    @inject(TokenServiceBindings.TOKEN_SERVICE)
    public jwtService: TokenService,
    @inject(UserServiceBindings.USER_SERVICE)
    public userService: MyUserService,
    @inject(SecurityBindings.USER, {optional: true})
    public user: UserProfile,
    @repository(UserRepository) protected userRepository: UserRepository,
  ) {}

    @post('/users/login', {
        responses: {
            '200': {
                description: 'Token',
                content: {
                    'application/json': {
                        schema: {
                            type: 'object',
                            properties: {
                                token: {
                                    type: 'string',
                                },
                            },
                        },
                    },
                },
            },
        },
    })
    @authenticate.skip()
    async login(@requestBody(CredentialsRequestBody) credentials: Credentials): Promise<{ token: string }> {
        // ensure the user exists, and the password is correct
        const user = await this.userService.verifyCredentials(credentials);
        // convert a User object into a UserProfile object (reduced set of properties)
        const userProfile = this.userService.convertToUserProfile(user);

        // create a JSON Web Token based on the user profile
        const token = await this.jwtService.generateToken(userProfile);
        return { token };
    }

    @get('/whoami', {
        responses: {
            '200': {
                description: 'Return current user',
                content: {
                    'application/json': {
                        schema: {
                            type: 'string',
                        },
                    },
                },
            },
        },
    })
    async whoAmI(
        @inject(SecurityBindings.USER)
        currentUserProfile: UserProfile,
    ): Promise<string> {
        return currentUserProfile[securityId];
    }

    @post('/users')
    @response(200, {
        description: 'User model instance',
        content: { 'application/json': { schema: getModelSchemaRef(User) } },
    })
    async create(
        @requestBody({
            content: {
                'application/json': {
                    schema: getModelSchemaRef(NewUserRequest, {
                        title: 'NewUser',
                        exclude: ['id'],
                    }),
                },
            },
        })
        newUserRequest: Omit<NewUserRequest, 'id'>,
    ): Promise<User> {
        const password = await hash(newUserRequest.password, await genSalt());
        const savedUser = await this.userRepository.create(
            _.omit(newUserRequest, 'password'),
        );

        await this.userRepository.userCredentials(savedUser.id).create({ password });

        return savedUser;
    }

    @get('/users/count')
    @response(200, {
        description: 'User model count',
        content: { 'application/json': { schema: CountSchema } },
    })
    async count(
        @param.where(User) where?: Where<User>,
    ): Promise<Count> {
        return this.userRepository.count(where);
    }

    @get('/users')
    @response(200, {
        description: 'Array of User model instances',
        content: {
            'application/json': {
                schema: {
                    type: 'array',
                    items: getModelSchemaRef(User, { includeRelations: false }),
                },
            },
        },
    })
    async find(
        @param.filter(User) filter?: Filter<User>,
    ): Promise<User[]> {
        return this.userRepository.find(filter);
    }

    @patch('/users')
    @response(200, {
        description: 'User PATCH success count',
        content: { 'application/json': { schema: CountSchema } },
    })
    async updateAll(
        @requestBody({
            content: {
                'application/json': {
                    schema: getModelSchemaRef(User, { partial: true }),
                },
            },
        })
        user: User,
        @param.where(User) where?: Where<User>,
    ): Promise<Count> {
        return this.userRepository.updateAll(user, where);
    }

    @get('/users/{id}')
    @response(200, {
        description: 'User model instance',
        content: {
            'application/json': {
                schema: getModelSchemaRef(User, { includeRelations: false }),
            },
        },
    })
    async findById(
        @param.path.string('id') id: string,
        @param.filter(User, { exclude: 'where' }) filter?: FilterExcludingWhere<User>
    ): Promise<User> {
        return this.userRepository.findById(id, filter);
    }

    @patch('/users/{id}')
    @response(204, {
        description: 'User PATCH success',
    })
    async updateById(
        @param.path.string('id') id: string,
        @requestBody({
            content: {
                'application/json': {
                    schema: getModelSchemaRef(User, { partial: true }),
                },
            },
        })
        user: User,
    ): Promise<void> {
        await this.userRepository.updateById(id, user);
    }

    @put('/users/{id}')
    @response(204, {
        description: 'User PUT success',
    })
    async replaceById(
        @param.path.string('id') id: string,
        @requestBody() user: User,
    ): Promise<void> {
        await this.userRepository.replaceById(id, user);
    }

    @del('/users/{id}')
    @response(204, {
        description: 'User DELETE success',
    })
    async deleteById(@param.path.string('id') id: string): Promise<void> {
        await this.userRepository.deleteById(id);
    }
}
