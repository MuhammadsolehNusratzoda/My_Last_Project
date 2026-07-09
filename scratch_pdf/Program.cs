using System;
using System.IO;
using UglyToad.PdfPig;

namespace PdfExtractor
{
    class Program
    {
        static void Main(string[] args)
        {
            string sourceDir = @"c:\Users\Сухайб\Desktop\TouristSystem\Project_TZ";
            string targetDir = @"c:\Users\Сухайб\Desktop\TouristSystem\Project_TZ_txt";
            
            if (!Directory.Exists(targetDir))
            {
                Directory.CreateDirectory(targetDir);
            }
            
            foreach (var file in Directory.GetFiles(sourceDir, "*.pdf"))
            {
                string fileName = Path.GetFileNameWithoutExtension(file);
                Console.WriteLine($"Extracting {fileName}...");
                string targetFile = Path.Combine(targetDir, fileName + ".txt");
                
                try
                {
                    using (var document = PdfDocument.Open(file))
                    using (var writer = new StreamWriter(targetFile))
                    {
                        foreach (var page in document.GetPages())
                        {
                            writer.WriteLine($"--- Page {page.Number} ---");
                            writer.WriteLine(page.Text);
                        }
                    }
                    Console.WriteLine($"Finished {fileName}.");
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"Error extracting {fileName}: {ex.Message}");
                }
            }
        }
    }
}
