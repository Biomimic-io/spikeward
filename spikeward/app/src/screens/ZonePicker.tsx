import { useState } from "preact/hooks";
import { get, post, type CfZone, type Zone } from "../api";
import { Btn, ErrorText, Empty, Loading } from "../ui";
import { useAsync, useLoad } from "../util";

/** Lists Cloudflare zones the token can see and adds them to Spikeward in watch or shadow mode. */
export function ZonePicker({ managedIds, onAdded, initial }: { managedIds: string[]; onAdded: () => void; initial?: CfZone[] }) {
  const { data, error, loading } = useLoad(async () => initial ?? (await get<{ zones: CfZone[] }>("/cloudflare/zones")).zones, [initial]);
  const [added, setAdded] = useState<string[]>([]);
  const [active, setActive] = useState<string | null>(null);
  const [mode, setMode] = useState<"watch" | "shadow">("shadow");
  const { busy, error: addError, run } = useAsync();

  const add = async (z: CfZone) => {
    setActive(z.id);
    const ok = await run(() => post("/zones", { zoneId: z.id, mode }));
    if (ok) {
      setAdded((a) => [...a, z.id]);
      onAdded();
    }
  };

  if (loading) return <Loading what="zones from Cloudflare" />;
  if (error) return <ErrorText error={error} />;
  const zones = data ?? [];
  if (!zones.length) return <Empty title="No zones visible to the token">Add zone access to your Cloudflare token, then re-verify it on the Account screen.</Empty>;
  return (
    <div class="stack">
    <fieldset class="mode-pick">
      <legend class="legend">Add zones in</legend>
      <label class="check">
        <input type="radio" name="add-mode" checked={mode === "shadow"} onChange={() => setMode("shadow")} />
        <span><strong>Shadow mode</strong>: Spikeward creates its rules on the zone, disabled, and logs what it would do. Switch to enforce when you trust it.</span>
      </label>
      <label class="check">
        <input type="radio" name="add-mode" checked={mode === "watch"} onChange={() => setMode("watch")} />
        <span><strong>Watch only</strong>: Spikeward emails you about spikes and never touches the zone's firewall. A read-only token is enough.</span>
      </label>
    </fieldset>
    <div class="zone-pick">
      {zones.map((z) => {
        const managed = managedIds.includes(z.id) || added.includes(z.id);
        return (
          <div class="zone-row" key={z.id}>
            <div>
              <strong class="break">{z.name}</strong>
              <div class="muted">{z.plan} plan · {z.account}</div>
              {active === z.id && <ErrorText error={addError} />}
            </div>
            {managed ? (
              <span class="ok-text">{added.includes(z.id) ? `Added in ${mode === "watch" ? "watch" : "shadow"} mode` : "Managed"}</span>
            ) : (
              <Btn small variant="primary" busy={busy && active === z.id} busyText="Adding…" disabled={busy} onClick={() => void add(z)} aria-label={`Add ${z.name} in ${mode} mode`}>
                Add zone
              </Btn>
            )}
          </div>
        );
      })}
    </div>
    </div>
  );
}

export type { Zone };
