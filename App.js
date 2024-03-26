import { StatusBar } from "expo-status-bar";
import { StyleSheet, Button, View, Text, TextInput } from "react-native";
import { useState, useEffect } from "react";
import * as SQLITE from "expo-sqlite";
import { Entypo } from "@expo/vector-icons";

export default function App() {
  const db = SQLITE.openDatabase("todo.db");
  const [isLoading, setIsLoading] = useState(true);
  const [todos, setTodos] = useState([]);
  const [todo, setTodo] = useState(null);

  useEffect(() => {
    db.transaction((tx) => {
      tx.executeSql(
        "CREATE TABLE IF NOT EXISTS todos (id INTEGER PRIMARY KEY AUTOINCREMENT, todo TEXT)"
      );
    });

    db.transaction((tx) => {
      tx.executeSql(
        "SELECT * FROM todos",
        null,
        (_, resultSet) => setTodos(resultSet.rows._array),
        (_, error) => console.log(error)
      );
    });

    setIsLoading(false);
  }, []);

  const addTodo = () => {
    db.transaction((tx) => {
      tx.executeSql(
        "INSERT INTO todos (todo) values (?)",
        [todo],
        (_, resultSet) => {
          let existingTodo = [...todos];
          existingTodo.push({ id: resultSet.insertId, todo: todo });

          setTodos(existingTodo);
          setTodo(null);
        },
        (_, error) => console.log(error)
      );
    });
  };

  const updateTodo = (id) => {
    db.transaction((tx) => {
      tx.executeSql(
        "UPDATE todos SET todo = ? WHERE id = ?",
        [todo, id],
        (_, resultSet) => {
          if (resultSet.rowsAffected > 0) {
            let existingTodo = [...todos];
            const indexToUpdate = existingTodo.findIndex(
              (todo) => todo.id === id
            );
            existingTodo[indexToUpdate].todo = todo;
            setTodos(existingTodo);
            setTodo(null);
          }
        },
        (_, error) => console.log(error)
      );
    });
  };

  const deleteTodo = (id) => {
    db.transaction((tx) => {
      tx.executeSql(
        "DELETE FROM todos WHERE id = ?",
        [id],
        (_, resultSet) => {
          if (resultSet.rowsAffected > 0) {
            let existingTodo = [...todos.filter((todo) => todo.id !== id)];

            setTodos(existingTodo);
          }
        },
        (_, error) => console.log(error)
      );
    });
  };

  const DisplayAllTodos = () => {
    return todos.map((todo, index) => {
      return (
        <View key={index} style={styles.row}>
          <Text>{todo.todo}</Text>
          <View style={styles.row}>
            <Entypo
              name="trash"
              size={24}
              color="black"
              onPress={() => deleteTodo(todo.id)}
            />
            <Entypo
              name="edit"
              size={24}
              color="black"
              onPress={() => updateTodo(todo.id)}
            />
          </View>
        </View>
      );
    });
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <Text>En cours de chargement...</Text>
      </View>
    );
  }

  return (
    <>
      <View style={styles.container}>
        <View style={styles.form}>
          <TextInput
            value={todo}
            placeholder="Votre tâche"
            onChangeText={setTodo}
            style={styles.input}
          />
          <Button title="+" onPress={addTodo} style={styles.buttonAdd} />
        </View>
        <DisplayAllTodos />
      </View>
      <StatusBar style="auto" />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 10,
  },
  space: {
    height: 40,
  },
  button: {
    width: 40,
    backgroundColor: "red",
    alignItems: "center",
    justifyContent: "center",
    padding: 10,
  },
  row: {
    flexDirection: "row",
    paddingLeft: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F1F1",
    alignItems: "center",
    alignSelf: "stretch",
    justifyContent: "space-between",
  },
  form: {
    flexDirection: "row",
    marginVertical: 20,
    alignItems: "center",
  },
  input: {
    flex: 1,
    paddingVertical: 3,
    paddingLeft: 5,
    marginRight: 2,
    borderWidth: 1,
    borderRadius: 10,
  },
  buttonAdd: {
    flex: 1,
    padding: 20,
  },
});
