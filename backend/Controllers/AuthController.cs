using Microsoft.AspNetCore.Mvc;
using backend.Models;
using backend.Services.User_serv;

[ApiController]
[Route("api/auth")]
public class AuthController : ControllerBase
{
    private readonly IUserService _userService;

    public AuthController(IUserService userService)
    {
        _userService = userService;
    }

    [HttpPost("register")]
    public IActionResult Register([FromBody] RegisterRequest request)
    {
        try
        {
            var user = _userService.RegisterUser(request.Name, request.Mail, request.Password, DateTime.Now, request.AvatarUrl);
            return Ok(new { UserId = user.Id });
        }
        catch (Exception ex)
        {
            return BadRequest(ex.Message);
        }
    }

    [HttpPost("login")]
    public IActionResult Login([FromBody] LoginRequest request)
    {
        try
        {
            var user = _userService.LoginUser(request.Mail, request.Password);
            if (user == null)
                return Unauthorized("Неверные учетные данные");

            return Ok(new { UserId = user.Id });
        }
        catch (Exception ex)
        {
            return StatusCode(500, ex.Message);
        }
    }
}

public class RegisterRequest
{
    public string Name { get; set; } = null!;
    public string Mail { get; set; } = null!;
    public string Password { get; set; } = null!;
    public string AvatarUrl { get; set; } = null!;
}

public class LoginRequest
{
    public string Mail { get; set; } = null!;
    public string Password { get; set; } = null!;
}