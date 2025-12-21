
using System.Security.Cryptography;
using System.Text;

namespace Backend.Helper;

public static class PasswordHashing
{
    public static void CreatePasswordHash(string pwd, out byte[] hash, out byte[] salt)
    {
        using var hmac = new HMACSHA512();
        salt = hmac.Key;
        hash = hmac.ComputeHash(Encoding.UTF8.GetBytes(pwd));
    }
    public static bool VerifyPasswordHash(string pwd, byte[] hash, byte[] salt)
    {
        using var hmac = new HMACSHA512(salt);
        var comp = hmac.ComputeHash(Encoding.UTF8.GetBytes(pwd));
        return comp.SequenceEqual(hash);
    }
}