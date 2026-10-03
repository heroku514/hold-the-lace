import { useEffect, useState } from "react";
import { Pressable, SafeAreaView, StyleSheet, Text, View } from "react-native";
import {
  dropHand,
  EMPTY_LACE,
  hasProgress,
  holdHand,
  laceLine,
  laceStatus,
  resetLace,
  tieBow,
  untieBow,
  type LaceState,
} from "./src/lace";
import { loadLace, saveLace } from "./src/store";

export default function App() {
  const [state, setState] = useState<LaceState>(EMPTY_LACE);
  const [note, setNote] = useState("Look at the lace.");
  const [ready, setReady] = useState(false);
  const [confirmNew, setConfirmNew] = useState(false);

  useEffect(() => {
    let alive = true;
    loadLace()
      .then((loaded) => {
        if (!alive) return;
        setState(loaded);
        setNote(hasProgress(loaded) ? "Saved lace loaded." : "Look at the lace.");
        setReady(true);
      })
      .catch(() => {
        if (alive) setNote("Could not read the lace.");
      });
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    if (!ready) return;
    saveLace(state).catch(() => setNote("Could not save the lace."));
  }, [ready, state]);

  if (!ready && note === "Look at the lace.") {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.center}>
          <Text style={styles.loading}>Loading the lace</Text>
        </View>
      </SafeAreaView>
    );
  }

  function apply(result: { state: LaceState; note: string }) {
    setState(result.state);
    setConfirmNew(false);
    setNote(result.note);
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.body}>
        <Text style={styles.title}>Hold the Lace</Text>
        <Text style={styles.note}>{note}</Text>
        <Text style={styles.count}>{laceStatus(state)}</Text>
        <Text style={styles.line}>{laceLine(state)}</Text>
        <View style={styles.row}>
          <BigButton label="Hold left" inRow onPress={() => apply(holdHand(state, "left"))} />
          <BigButton label="Hold right" inRow onPress={() => apply(holdHand(state, "right"))} />
        </View>
        <View style={styles.row}>
          <BigButton label="Drop left" inRow onPress={() => apply(dropHand(state, "left"))} />
          <BigButton label="Drop right" inRow onPress={() => apply(dropHand(state, "right"))} />
        </View>
        <View style={styles.row}>
          <BigButton label="Tie the bow" inRow onPress={() => apply(tieBow(state))} />
          <BigButton label="Untie the bow" inRow onPress={() => apply(untieBow(state))} />
        </View>
        {confirmNew ? (
          <View style={styles.row}>
            <BigButton label="Confirm new" filled inRow onPress={onConfirmNew} />
            <BigButton label="Cancel new" inRow onPress={onCancelNew} />
          </View>
        ) : (
          <BigButton label="New lace" onPress={() => setConfirmNew(true)} />
        )}
      </View>
    </SafeAreaView>
  );

  function onConfirmNew() {
    const result = resetLace();
    setState(result.state);
    setConfirmNew(false);
    setNote(result.note);
  }

  function onCancelNew() {
    setConfirmNew(false);
    setNote("New lace canceled.");
  }
}

function BigButton({
  label,
  onPress,
  filled,
  inRow,
}: {
  label: string;
  onPress: () => void;
  filled?: boolean;
  inRow?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={[styles.button, inRow && styles.buttonRow, filled && styles.buttonFilled]}
    >
      <Text style={[styles.buttonText, filled && styles.buttonTextFilled]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#F6EDE4" },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  loading: { fontSize: 28, fontWeight: "800", color: "#3A2418" },
  body: { flex: 1, paddingHorizontal: 16, paddingTop: 8, gap: 8 },
  title: { fontSize: 32, fontWeight: "800", color: "#3A2418" },
  note: { fontSize: 18, color: "#6A4638", minHeight: 24 },
  count: { fontSize: 22, fontWeight: "700", color: "#3A2418" },
  line: { fontSize: 34, fontWeight: "800", color: "#8C2F2F", lineHeight: 40 },
  row: { flexDirection: "row", gap: 8 },
  button: {
    minHeight: 58,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "#3A2418",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 8,
    backgroundColor: "#FFFFFF",
  },
  buttonRow: { flex: 1 },
  buttonFilled: { backgroundColor: "#3A2418" },
  buttonText: { fontSize: 18, fontWeight: "800", color: "#3A2418", textAlign: "center" },
  buttonTextFilled: { color: "#FFFFFF" },
});
