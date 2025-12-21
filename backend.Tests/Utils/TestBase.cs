using System.Net.Http;

namespace Backend.Tests.Utils;

public abstract class TestBase
{
    protected readonly CustomWebApplicationFactory Factory;
    protected readonly string AdminToken;

    protected TestBase()
    {
        Factory = new CustomWebApplicationFactory();
        // force host build and then seed DB safely
        Factory.CreateClient();
        Factory.EnsureSeeded();
        AdminToken = Factory.AdminToken;
    }

    protected HttpClient GetClient(string token = null)
    {
        if (string.IsNullOrEmpty(token)) return Factory.CreateClient();
        return Factory.CreateClientWithToken(token);
    }
}
