FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

COPY apps/api/ChaosDrive.slnx apps/api/
COPY apps/api/ChaosDrive.Api/ChaosDrive.Api.csproj apps/api/ChaosDrive.Api/
RUN dotnet restore apps/api/ChaosDrive.Api/ChaosDrive.Api.csproj

COPY apps/api/ apps/api/
WORKDIR /src/apps/api/ChaosDrive.Api

FROM build AS dev
ENV ASPNETCORE_ENVIRONMENT=Development
ENV ASPNETCORE_URLS=http://0.0.0.0:8080
ENV DOTNET_USE_POLLING_FILE_WATCHER=1
EXPOSE 8080
ENTRYPOINT ["dotnet", "watch", "run", "--no-launch-profile", "--urls", "http://0.0.0.0:8080"]

FROM build AS publish
RUN dotnet publish -c Release -o /app/publish /p:UseAppHost=false

FROM build AS migrations
ARG TARGETARCH
ENV PATH="$PATH:/root/.dotnet/tools"
# .NET RIDs are linux-x64 / linux-arm64; BuildKit reports amd64 / arm64.
RUN case "$TARGETARCH" in \
        amd64) RID=linux-x64 ;; \
        arm64) RID=linux-arm64 ;; \
        *) echo "Unsupported TARGETARCH: $TARGETARCH" >&2; exit 1 ;; \
    esac \
    && dotnet tool install --global dotnet-ef --version 10.0.13 \
    && dotnet restore /src/apps/api/ChaosDrive.Api/ChaosDrive.Api.csproj --runtime "$RID" \
    && dotnet ef migrations bundle \
        --project /src/apps/api/ChaosDrive.Api/ChaosDrive.Api.csproj \
        --startup-project /src/apps/api/ChaosDrive.Api/ChaosDrive.Api.csproj \
        --configuration Release \
        --runtime "$RID" \
        --self-contained \
        --output /app/efbundle

FROM mcr.microsoft.com/dotnet/runtime-deps:10.0 AS migrate
WORKDIR /app
RUN apt-get update \
    && apt-get install -y --no-install-recommends libgssapi-krb5-2 \
    && rm -rf /var/lib/apt/lists/*
COPY --from=migrations /app/efbundle ./efbundle
RUN chmod +x ./efbundle
ENTRYPOINT ["./efbundle"]

FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS prod
WORKDIR /app
ENV ASPNETCORE_URLS=http://+:8080
ENV ASPNETCORE_HTTP_PORTS=8080
COPY --from=publish /app/publish .
RUN mkdir -p /keys && chown -R app:app /keys
USER app
EXPOSE 8080
ENTRYPOINT ["dotnet", "ChaosDrive.Api.dll"]
