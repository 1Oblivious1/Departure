using Microsoft.AspNetCore.Mvc;
using System;
using backend.Services.User_serv;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UserController : ControllerBase
    {
        private readonly IUserService _userService;

        public UserController(IUserService userService)
        {
            _userService = userService;
        }

        [HttpPost("subscribe")]
        public IActionResult Subscribe([FromBody] SubscriptionRequest request)
        {
            try
            {
                _userService.SubscribeUser(request.SubscriberId, request.TargetUserId);
                return Ok();
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpPost("unsubscribe")]
        public IActionResult Unsubscribe([FromBody] SubscriptionRequest request)
        {
            try
            {
                _userService.UnsubscribeUser(request.SubscriberId, request.TargetUserId);
                return Ok();
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpGet("{userId}/subscriptions")]
        public IActionResult GetSubscriptions(int userId)
        {
            try
            {
                var (subscriptions, subscribers) = _userService.GetUserSubscriptions(userId);
                return Ok(new { Subscriptions = subscriptions, Subscribers = subscribers });
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpPost("check-subscription")]
        public IActionResult CheckSubscription([FromBody] SubscriptionRequest request)
        {
            try
            {
                var status = _userService.CheckSubscriptionStatus(request.SubscriberId, request.TargetUserId);
                return Ok(status);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        public class SubscriptionRequest
        {
            public int SubscriberId { get; set; }
            public int TargetUserId { get; set; }
        }
    }
} 