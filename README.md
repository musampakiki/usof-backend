# USOF-BACKEND REST API

#installation for user
- 

- Rename file .env-example to .env
- Before start, you need to install PostgreSQL

> CREATE DATABASE (name db in file .env);

Enter command in terminal
> npm i
> npm run start
```

- or for development 

```md
> npm run dev
```



## Technologies

- ### Back end

    - [Express] - Nodejs framwork for building the REST Apis
    - [Nodemailer]- for mail
    - [cors]- to enable Enable Cross-Origin Requests
    - [sequelize orm]- for good sql structure
    - [PostgreSQL]- SQL database
    - [multer]- for uploading images
    - [Jsonwebtoken](https://github.com/auth0/node-jsonwebtoken#readme)- authorization with tokens
    - [ESLint] - for good style codding


##**Authentication entity**:<br/>

- [x] POST - /api/v1/auth/signup - registration of a new user, required parameters are [login, password, password confirmation, email]<br/>
- [x] POST - /api/v1/auth/login - log in user, required parameters are [login, password]. Only users with a confirmed email can sign in<br/>
- [x] POST - /api/v1/auth/logout - log out authorized user<br/>
- [x] POST - /api/auth/me - select home page<br/>

##**User entity**:<br/>

- [x] GET - /api/v1/users - get all users<br/>
- [x] GET - /api/v1/users/:id - get Profile specified user data<br/>
- [x] POST - /api/v1/users - create a new user, required parameters are [login, password, password confirmation, email, role]. This feature must be accessible only for admins<br/>
- [x] POST - /api/v1/users/avatar - let an authorized user upload his/her avatar. The user will be designated by his/her access token<br/>
- [x] PATCH - /api/v1/users/:id - update Profile user data<br/>
- [x] GET - /api/v1/users/likedArticles - get Liked Posts of user<br/>
- [x] GET - /api/v1/users/feed - get feed<br/>
- [x] GET - /api/v1/users/search - get search users<br/>
- [x] GET - /api/v1/users/:id/togglesubscribe - get user`s Subscribe<br/>



##**Post entity**:<br/>

- [x] GET - /api/v1/articles- get recommended all posts.<br/>
- [x] POST - /api/v1/articles - create a new post, required parameters are [title, text, description, categories, user]<br/>  
- [x] GET - /api/v1/articles/:id - get specified post data.<br/>
- [x] PATCH - /api/v1/articles/:id - update the specified post <br/>  
- [x] GET - /api/v1/articles/:id/comment - get all comments for the specified post.Endpoint is public<br/>
- [x] POST - /api/v1/articles/:id/comment - create a new comment, required parameter is [text, user]<br/>
- [x] GET - /api/v1/articles/:id/like - get all likes under the specified post<br/>
- [x] POST - /api/v1/articles/:id/like - create a new like under a post<br/>
- [x] GET - /api/v1/articles/:id/dislike - get all dislikes under the specified post<br/>
- [x] POST - /api/v1/articles/:id/dislike - create a new dislike under a post<br/>
- [x] GET - /api/v1/articles/:id/view - get new view post<br/>
- [x] GET - /api/v1/articles/search - get search posts<br/>

##**Categories entity**:<br/>

- [x] GET - /api/v1/categories - get all categories<br/>
- [x] POST - /api/v1/categories - create a new category, required parameter is [title]<br/>  
- [x] GET - /api/v1/categories/:id - get specified category data<br/>
- [x] GET - /api/v1/categories/search - get search categories<br/>

##**Database tables**:<br/>

- Users<br/>
- Articles<br/>
- Comments<br/>
- Categories<br/>
- ArticleLikes<br/>
- Subscriptions<br/>
- Views<br/>




## License

MIT
