using Backend.Tests.Utils;
using NUnit.Framework;
using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using System.Threading.Tasks;

namespace Backend.Tests;

public class AuthControllerTests : TestBase
{
    [Test]
    public async Task Register_FirstUserForNewCompany_IsAdmin()
    {
        var client = GetClient();
        var dto = new { Username = "newadmin@test", Password = "pass123", FirstName = "New", LastName = "Admin", CompanyName = "NewCoRegister" };
        var res = await client.PostAsJsonAsync("/api/auth/register", dto);
        Assert.That(res.StatusCode, Is.EqualTo(HttpStatusCode.OK));
        var body = JsonDocument.Parse(await res.Content.ReadAsStringAsync());
        Assert.That(body.RootElement.GetProperty("role").GetString(), Is.EqualTo("Admin"));
    }

    [Test]
    public async Task Login_ReturnsToken_And_UserInfo_Works()
    {
        var client = GetClient();
        var registerDto = new { Username = "logintest@test", Password = "pw1", FirstName = "L", LastName = "T", CompanyName = "LoginCo" };
        var reg = await client.PostAsJsonAsync("/api/auth/register", registerDto);
        Assert.That(reg.StatusCode, Is.EqualTo(HttpStatusCode.OK));

        var loginDto = new { Username = "logintest@test", Password = "pw1" };
        var login = await client.PostAsJsonAsync("/api/auth/login", loginDto);
        Assert.That(login.StatusCode, Is.EqualTo(HttpStatusCode.OK));
        var loginObj = JsonDocument.Parse(await login.Content.ReadAsStringAsync());
        var token = loginObj.RootElement.GetProperty("token").GetString();
        Assert.That(token, Is.Not.Null);

        // call userinfo
        var authed = GetClient(token);
        var info = await authed.GetAsync("/api/auth/userinfo");
        Assert.That(info.StatusCode, Is.EqualTo(HttpStatusCode.OK));
        var infoObj = JsonDocument.Parse(await info.Content.ReadAsStringAsync());
        Assert.That(infoObj.RootElement.GetProperty("username").GetString(), Is.EqualTo("logintest@test"));
    }

    [Test]
    public async Task Logout_RevokesToken()
    {
        var client = GetClient();
        var registerDto = new { Username = "logouttest@test", Password = "pw1", FirstName = "L", LastName = "T", CompanyName = "LogoutCo" };
        var reg = await client.PostAsJsonAsync("/api/auth/register", registerDto);
        Assert.That(reg.StatusCode, Is.EqualTo(HttpStatusCode.OK));

        var loginDto = new { Username = "logouttest@test", Password = "pw1" };
        var login = await client.PostAsJsonAsync("/api/auth/login", loginDto);
        var loginObj = JsonDocument.Parse(await login.Content.ReadAsStringAsync());
        var token = loginObj.RootElement.GetProperty("token").GetString();

        var authed = GetClient(token);
        var logout = await authed.PostAsync("/api/auth/logout", null);
        Assert.That(logout.StatusCode, Is.EqualTo(HttpStatusCode.NoContent));

        // token now revoked — subsequent authenticated call should fail with Unauthorized
        var after = GetClient(token);
        var info = await after.GetAsync("/api/auth/userinfo");
        Assert.That(info.StatusCode, Is.EqualTo(HttpStatusCode.Unauthorized));
    }
}