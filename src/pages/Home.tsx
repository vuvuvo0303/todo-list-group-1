import { SearchOutlined } from "@ant-design/icons";
import {
  Button,
  Form,
  FormProps,
  Input,
  InputRef,
  Select,
  Space,
  Table,
  TableColumnType,
  TableColumnsType,
} from "antd";
import { FilterDropdownProps } from "antd/es/table/interface";
import { useEffect, useRef, useState } from "react";
import Highlighter from "react-highlight-words";
import { formatDateToString } from "../utils/dateUtils";
import 'react-toastify/dist/ReactToastify.css';
import { toast } from "react-toastify";

type FieldType = {
  title?: string;
  status?: string;
};
interface ToDoType {
  key: number;
  title: string;
  status: string;
  createdDate: string;
}
type DataIndex = keyof ToDoType;

const Home = () => {

  const [searchText, setSearchText] = useState("");
  const [searchedColumn, setSearchedColumn] = useState("");
  //(array of ToDoType objects) and the initialization value is [] (an empty array).
  const [todoItems, setTodoItems] = useState<ToDoType[]>([]);
  const [renderKey, setRenderKey] = useState(0);

  //load data from localStorage when component render 1st time
  useEffect(() => {
    //getItem returns a string if any data is stored with the key
    const dataStr = localStorage.getItem("todo-data");
    let localData = [];
    if (dataStr != null) {
      //This data will be converted from JSON strings into JavaScript objects using JSON.parse
      localData = JSON.parse(dataStr);
    } else {
      localData = [];
    }
    setTodoItems(localData);
  }, []);

  const onFinish: FormProps<FieldType>["onFinish"] = (values) => {
    const newItem: ToDoType = {
      //check if array todoItems have any element, if it had, key + 1(index + 1), if not key = 0(first element)
      key: todoItems[todoItems.length - 1] ? todoItems[todoItems.length - 1].key + 1 : 0,
      title: values.title as string,
      status: values.status as string,
      //toISOString()) is always in the standard format and does not depend on the system's regional settings
      createdDate: new Date().toISOString(),
    };
    setTodoItems([...todoItems, newItem]);
    localStorage.setItem("todo-data", JSON.stringify([...todoItems, newItem]));
    setRenderKey(renderKey + 1);
  };

  const onFinishFailed: FormProps<FieldType>["onFinishFailed"] = (errorInfo) => {
    console.log("Failed:", errorInfo);
  };
  //
  const searchInput = useRef<InputRef>(null);

  const handleSearch = (selectedKeys: string[], confirm: FilterDropdownProps["confirm"], dataIndex: DataIndex) => {
    confirm();
    setSearchText(selectedKeys[0]);
    setSearchedColumn(dataIndex);
  };

  const handleReset = (clearFilters: () => void) => {
    clearFilters();
    setSearchText("");
  };

  //handleDelete takes a key (a unique identifier for each ToDoItem) as a parameter.
  //This function filters todoItems to remove the item with the corresponding key.
  //Update the state todoItems with the new array.
  //Update localStorage with the new array.
  const handleDelete = (key: number) => {
    const updateTodoItems = todoItems.filter((item) => item.key !== key);
    setTodoItems(updateTodoItems);
    localStorage.setItem("todo-data", JSON.stringify(updateTodoItems));
    toast.success("Delete successfully!");
  }

  const getColumnSearchProps = (dataIndex: DataIndex): TableColumnType<ToDoType> => ({
    filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters, close }) => (
      <div style={{ padding: 8 }} onKeyDown={(e) => e.stopPropagation()}>
        <Input
          ref={searchInput}
          placeholder={`Search ${dataIndex}`}
          value={selectedKeys[0]}
          onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
          onPressEnter={() => handleSearch(selectedKeys as string[], confirm, dataIndex)}
          style={{ marginBottom: 8, display: "block" }}
        />
        <Space>
          <Button
            type="primary"
            onClick={() => handleSearch(selectedKeys as string[], confirm, dataIndex)}
            icon={<SearchOutlined />}
            size="small"
            style={{ width: 90 }}
          >
            Search
          </Button>
          <Button onClick={() => clearFilters && handleReset(clearFilters)} size="small" style={{ width: 90 }}>
            Reset
          </Button>
          <Button
            type="link"
            size="small"
            onClick={() => {
              confirm({ closeDropdown: false });
              setSearchText((selectedKeys as string[])[0]);
              setSearchedColumn(dataIndex);
            }}
          >
            Filter
          </Button>
          <Button
            type="link"
            size="small"
            onClick={() => {
              close();
            }}
          >
            close
          </Button>
        </Space>
      </div>
    ),
    filterIcon: (filtered: boolean) => <SearchOutlined style={{ color: filtered ? "#1677ff" : undefined }} />,
    onFilter: (value, record) =>
      record[dataIndex]
        .toString()
        .toLowerCase()
        .includes((value as string).toLowerCase()),
    onFilterDropdownOpenChange: (visible) => {
      if (visible) {
        setTimeout(() => searchInput.current?.select(), 100);
      }
    },
    render: (text) =>
      searchedColumn === dataIndex ? (
        <Highlighter
          highlightStyle={{ backgroundColor: "#ffc069", padding: 0 }}
          searchWords={[searchText]}
          autoEscape
          textToHighlight={text ? text.toString() : ""}
        />
      ) : (
        text
      ),
  });


  const columns: TableColumnsType<ToDoType> = [
    {
      title: "Title",
      dataIndex: "title",
      key: "title",
      ...getColumnSearchProps("title"),
    },
    {
      title: "Created Date",
      dataIndex: "createdDate",
      key: "createdDate",
      width: "20%",
      render: (text: string) => <span>{formatDateToString(new Date(text))}</span>,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: "20%",
      ...getColumnSearchProps("status"),
    },
    {
      title: "Action",
      dataIndex: "",
      key: "x",
      width: "10%",
      render: (_, record) => (
        <Button type="link" onClick={() => handleDelete(record.key)}>
          Delete
        </Button>
      ),
    },
  ];
  return (
    <div className="">
      <div className="bg-gradient-to-r from-cyan-500 to-blue-500 py-5 px-20">
        <h1 className="text-center text-3xl mb-5 text-white font-bold">TO DO LIST</h1>
        <Form
          name="basic"
          initialValues={{ remember: true }}
          onFinish={onFinish}
          onFinishFailed={onFinishFailed}
          autoComplete="off"
          className="grid grid-cols-11 gap-5"
        >
          <Form.Item
            name="title"
            rules={[{ required: true, message: "Please input your title!" }]}
            className="col-span-8"
          >
            <Input placeholder="Title" />
          </Form.Item>
          <Form.Item name="status" rules={[{ required: true, message: "Please input!" }]} className="col-span-2">
            <Select
              placeholder="Status"
              options={[
                { value: "To Do", label: "To Do" },
                { value: "In progress", label: "In progress" },
                { value: "Done", label: "Done" },
              ]}
            />
          </Form.Item>
          <Form.Item className="col-span-1">
            <Button type="primary" htmlType="submit">
              Add
            </Button>
          </Form.Item>
        </Form>
      </div>
      <div className="p-5">
        <Table columns={columns} dataSource={todoItems} />
      </div>
    </div>
  );
};

export default Home;
