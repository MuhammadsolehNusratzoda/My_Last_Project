using MediatR;
using Microsoft.AspNetCore.Http;

namespace TouristSystem.Application.Features.ProviderRegistration.Commands.UploadProviderDocument;

public record UploadProviderDocumentCommand(IFormFile File, string Category) : IRequest<string>;
