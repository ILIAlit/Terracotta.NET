using Microsoft.AspNetCore.SignalR;

namespace KgPlitka.Hubs
{
    public class PushHub : Hub
    {
        public async Task Send()
        {
            await this.Clients.Others.SendAsync("Send", "Новые записи");
        }
    }
}
