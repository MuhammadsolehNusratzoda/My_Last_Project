using System.Threading.Tasks;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using TouristSystem.Application.Features.Auth.Commands.Login;
using TouristSystem.Application.Features.Auth.Commands.Register;

namespace TouristSystem.WebApi.Controllers;

/// <summary>
/// Handles user registration and authentication request actions.
/// </summary>
[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly ISender _sender;

    public AuthController(ISender sender)
    {
        _sender = sender;
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterCommand command)
    {
        var response = await _sender.Send(command);
        return Ok(response);
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginCommand command)
    {
        var response = await _sender.Send(command);
        return Ok(response);
    }
}
