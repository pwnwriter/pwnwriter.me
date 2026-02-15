---
title: "PostgreSQL with Nix flake"
pubDate: 2026-02-15
modDate: 2026-02-15
tags: [nix]
---

Was working on a project that needed postgres. Didn't want to install it globally or spin up docker for something this simple. So I wrote a flake that gives me a local postgres instance — data stays in `.pg/`, auto-starts when I enter the shell, stops when I leave.

No system pollution, no port conflicts with other projects. Just `nix develop` and I'm ready to go.

```nix
{
  inputs = {
    nixpkgs.url = "github:nixos/nixpkgs/nixos-unstable";
  };

  outputs =
    { nixpkgs, ... }:
    let
      systems = [ "x86_64-linux" "aarch64-linux" "x86_64-darwin" "aarch64-darwin" ];
      forAllSystems = fn: nixpkgs.lib.genAttrs systems (system: fn (import nixpkgs { inherit system; }));
    in
    {
      devShells = forAllSystems (pkgs: {
        default = pkgs.mkShell {
          packages = with pkgs; [
            postgresql
            pgcli          # nicer postgres cli with autocomplete
            sqlx-cli       # if you're doing rust + sqlx
          ];

          shellHook = ''
            export PGDATA="$PWD/.pg/data"
            export PGHOST="$PWD/.pg"
            export PGPORT=5432
            export PGDATABASE="devdb"
            export DATABASE_URL="postgresql:///devdb?host=$PGHOST"

            if [ ! -d "$PGDATA" ]; then
              echo "Initializing postgres..."
              initdb -D "$PGDATA" --auth=trust --no-locale --encoding=UTF8
              echo "unix_socket_directories = '$PGHOST'" >> "$PGDATA/postgresql.conf"
            fi

            if ! pg_ctl status -D "$PGDATA" > /dev/null 2>&1; then
              mkdir -p "$PGHOST"
              pg_ctl start -D "$PGDATA" -l "$PGHOST/log" -o "-c listen_addresses="
              createdb "$PGDATABASE" 2>/dev/null || true
            fi

            trap "pg_ctl stop -D '$PGDATA' -m fast 2>/dev/null" EXIT
          '';
        };
      });
    };
}
```

Add `.pg/` to your `.gitignore` and you're set.
