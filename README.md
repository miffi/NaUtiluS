# NaUtiluS

A graph of all the modules of NUS

### Running a dev build of the backend
- Install [just](https://github.com/casey/just)
- Add a .env file in the project root with
  ```sh
  NEO4JPASSWORD="password-string-here"
  ```
  *This file must not be merged. I don't want to have to delete our database
  instance.*
- (Optional) Add a `PORT` var to .env to change the port from the default 8080
- Run `just serve`, the backend will start at `localhost:PORT`
