
using KgPlitka.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace KgPlitka.Controllers
{
    [ApiController]
    [Route("home")]
    public class HomeController : Controller
    {
        ApplicationContext db;
        private readonly ILogger<HomeController> _logger;

        public HomeController(ApplicationContext context, ILogger<HomeController> logger)
        {
            this.db = context;
            _logger = logger;
        }

        [HttpGet]
        public IActionResult Index()
        {
            return View();
        }

        [HttpGet("GetJsonProducts")]
        public async Task<ActionResult<IEnumerable<Product>>> GetJsonProducts()
        {
            var products = await db.Products.ToListAsync();

            return await db.Products.ToListAsync();
        }

        [HttpGet("{GetSearchProduct}")]
        public async Task<ActionResult<Product>> GetSearchProduct(string searchData, string searchTag)
        {
            if (searchTag == "part")
            {
                var searchProducts = await db.Products.Where(p => p.Part.Contains(searchData)).ToListAsync();
                return Ok(searchProducts);
            }
            else
            {
                var searchProducts = await db.Products.Where(p => p.Name.Contains(searchData)).ToListAsync();
                return Ok(searchProducts);
            }

        }

        [HttpGet("getProductById/{id}")]
        public async Task<ActionResult<Product>> GetProductById(int id)
        {
            return await db.Products.FindAsync(id);
        }

        [HttpPost]
        public async Task<ActionResult<Product>> PostAddProduct(Product product)
        {
            if (product == null)
            {
                return NotFound();
            }
            db.Products.Add(product);
            await db.SaveChangesAsync();
            return Ok(product);
        }

        [HttpDelete("{id}")]
        public async Task<ActionResult<Product>> DeleteProduct(int id)
        {
            Product product = db.Products.FirstOrDefault(x => x.Id == id);
            if (product == null)
            {
                return NotFound();
            }
            db.Products.Remove(product);
            await db.SaveChangesAsync();
            return Ok(product);
        }

        [HttpPut]
        public async Task<ActionResult<Product>> PutProduct(Product product)
        {
            if (product == null)
            {
                return NotFound();
            }
            if (!db.Products.Any(x => x.Id == product.Id))
            {
                return NotFound();
            }
            db.Update(product);
            await db.SaveChangesAsync();
            return Ok(product);
        }
    }
}