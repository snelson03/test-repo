import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { AppState, AppStateStatus } from "react-native";
import { useUser } from "@/context/UserContext";
import {
  fetchRoomAvailabilitySnapshot,
  type RoomAvailabilitySnapshotItem,
} from "@/utils/api";

const POLL_MS = 5000;

type RoomAvailabilityContextValue = {
  /** room id -> is_available (from latest successful snapshot) */
  availabilities: Record<number, boolean>;
  /** room id -> building id (same snapshot) */
  buildingIdByRoomId: Record<number, number>;
  revision: string | null;
};

const RoomAvailabilityContext =
  createContext<RoomAvailabilityContextValue | null>(null);

function applyRoomsToMaps(rooms: RoomAvailabilitySnapshotItem[]): {
  availabilities: Record<number, boolean>;
  buildingIdByRoomId: Record<number, number>;
} {
  const availabilities: Record<number, boolean> = {};
  const buildingIdByRoomId: Record<number, number> = {};
  for (const r of rooms) {
    availabilities[r.id] = r.is_available;
    buildingIdByRoomId[r.id] = r.building_id;
  }
  return { availabilities, buildingIdByRoomId };
}

export function RoomAvailabilityProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useUser();
  const [availabilities, setAvailabilities] = useState<
    Record<number, boolean>
  >({});
  const [buildingIdByRoomId, setBuildingIdByRoomId] = useState<
    Record<number, number>
  >({});
  const [revision, setRevision] = useState<string | null>(null);
  const revisionRef = useRef<string | null>(null);

  const reset = useCallback(() => {
    revisionRef.current = null;
    setRevision(null);
    setAvailabilities({});
    setBuildingIdByRoomId({});
  }, []);

  useEffect(() => {
    if (!user) {
      reset();
      return;
    }

    revisionRef.current = null;
    let cancelled = false;
    let intervalId: ReturnType<typeof setInterval> | null = null;

    const poll = async () => {
      try {
        const result = await fetchRoomAvailabilitySnapshot(
          revisionRef.current,
        );
        if (cancelled) return;
        if (result.unchanged) {
          return;
        }
        revisionRef.current = result.revision;
        setRevision(result.revision);
        const maps = applyRoomsToMaps(result.rooms);
        setAvailabilities(maps.availabilities);
        setBuildingIdByRoomId(maps.buildingIdByRoomId);
      } catch {
        // keep last known availability on transient errors
      }
    };

    const startInterval = () => {
      if (intervalId !== null) return;
      intervalId = setInterval(() => {
        void poll();
      }, POLL_MS);
    };

    const stopInterval = () => {
      if (intervalId !== null) {
        clearInterval(intervalId);
        intervalId = null;
      }
    };

    const onAppState = (next: AppStateStatus) => {
      if (next === "active") {
        void poll();
        startInterval();
      } else {
        stopInterval();
      }
    };

    void poll();
    startInterval();
    const sub = AppState.addEventListener("change", onAppState);

    return () => {
      cancelled = true;
      stopInterval();
      sub.remove();
    };
  }, [user?.email, reset]);

  const value: RoomAvailabilityContextValue = {
    availabilities,
    buildingIdByRoomId,
    revision,
  };

  return (
    <RoomAvailabilityContext.Provider value={value}>
      {children}
    </RoomAvailabilityContext.Provider>
  );
}

export function useRoomAvailability() {
  const ctx = useContext(RoomAvailabilityContext);
  if (!ctx) {
    throw new Error(
      "useRoomAvailability must be used within RoomAvailabilityProvider",
    );
  }
  return ctx;
}

/** Merge live availability over static room objects from list/detail APIs. */
export function mergeRoomAvailability<T extends { id: number; is_available: boolean }>(
  room: T,
  availabilities: Record<number, boolean>,
): T {
  if (!Object.prototype.hasOwnProperty.call(availabilities, room.id)) {
    return room;
  }
  if (availabilities[room.id] === room.is_available) {
    return room;
  }
  return { ...room, is_available: availabilities[room.id] };
}
