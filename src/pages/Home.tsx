import { QuestionCircleOutlined, SearchOutlined } from "@ant-design/icons";
import {
  Button,
  Form,
  FormProps,
  Input,
  InputRef,
  Modal,
  Popconfirm,
  Select,
  Space,
  Table,
  TableColumnType,
  TableColumnsType,
} from "antd";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FilterDropdownProps } from "antd/es/table/interface";
import { useEffect, useRef, useState } from "react";
import Highlighter from "react-highlight-words";
import { formatDateToString } from "../utils/dateUtils";
import { useForm } from "antd/es/form/Form";

type FieldType = {
  title?: string;
  status?: string;
};
type ToDoType = {
  key: number;
  title: string;
  status: string;
  createdDate: string;
};
type DataIndex = keyof ToDoType;

const Home = () => {
  const [searchText, setSearchText] = useState("");
  const [searchedColumn, setSearchedColumn] = useState("");
  //(array of ToDoType objects) and the initialization value is [] (an empty array).
  const [todoItems, setTodoItems] = useState<ToDoType[]>([]);
  const [renderKey, setRenderKey] = useState(0);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedTodoItem, setSelectedTodoItem] = useState<ToDoType | null>(null);
  const [form] = useForm();

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
    form.resetFields();

    toast.success(`Add ${values.title} for new rask sucessfully`);
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

  const handleEdit = (todoItem: ToDoType) => {
    setSelectedTodoItem(todoItem);
    setEditModalVisible(true);
  };

  const handleUpdateTodo = (key: number, updatedData: ToDoType) => {
    const updatedItems = todoItems.map((item) => (item.key === key ? { ...item, ...updatedData } : item));
    setTodoItems(updatedItems);
    localStorage.setItem("todo-data", JSON.stringify(updatedItems));
    setEditModalVisible(false);
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
  };

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
      render: (_: any, record: ToDoType) => (
        <Space size="middle">
          <Button onClick={() => handleEdit(record)} type="primary">
            Edit
          </Button>
          <Popconfirm
            title="Delete the task "
            description="Are you sure to delete this task?"
            okText="Yes"
            cancelText="No"
            icon={<QuestionCircleOutlined style={{ color: "red" }} />}
            onConfirm={() => handleDelete(record.key)} // Đảm bảo dùng prop onConfirm để xử lý xóa
          >
            <Button type="primary" danger>
              Xóa
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];
  return (
    <div className="">
      <div className="bg-gradient-to-r from-cyan-500 to-blue-500 py-5 px-20">
        <h1 className="text-center text-3xl mb-5 text-white font-bold">TO DO LIST</h1>
        <Form
          form={form}
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
            <Button type="primary" htmlType="submit" style={{ backgroundColor: "#32CD32", borderColor: "green" }}>
              Add
            </Button>
          </Form.Item>
        </Form>
      </div>
      <div className="p-5">
        <Table columns={columns} dataSource={todoItems} />
      </div>
      <Modal title="Edit Task" visible={editModalVisible} onCancel={() => setEditModalVisible(false)} footer={null}>
        {/* Biểu mẫu chỉnh sửa */}
        <Form
          form={form}
          onFinish={(values) => {
            handleUpdateTodo(selectedTodoItem!.key, values as ToDoType);
            setEditModalVisible(false);
          }}
          initialValues={
            selectedTodoItem
              ? {
                  title: selectedTodoItem.title,
                  status: selectedTodoItem.status,
                }
              : undefined
          }
        >
          <Form.Item name="title" label="Title" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="status" label="Status" rules={[{ required: true }]}>
            <Select>
              <Select.Option value="To Do">To Do</Select.Option>
              <Select.Option value="In progress">In progress</Select.Option>
              <Select.Option value="Done">Done</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">
              Save
            </Button>
          </Form.Item>
        </Form>
      </Modal>
      <ToastContainer />;
    </div>
  );
};

export default Home;
