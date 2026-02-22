import React, { useState, useEffect } from 'react';
import { Form, Input, Button, DatePicker, Rate, Card, Select, InputNumber, Space, message, Divider , Upload, Modal} from 'antd';
import { MinusCircleOutlined, PlusOutlined, SaveOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs'; // 必须引入，用于处理日期回显

const { TextArea } = Input;

// 模拟已有数据（如果是新建则为空）
const mockExistingData = {
    nameCn: "希尔顿大酒店",
    nameEn: "Hilton Hotel",
    address: "北京市朝阳区",
    star: 5,
    openedAt: "2010-05-01", // 字符串格式
    tags: ["免费停车", "健身房"],
    rooms: [
      { name: "标准大床房", price: 500, count: 10 }
    ],
    images: 
    [
      "https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3"
    ]
};

const MerchantHotelEdit = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
   // ============ 新增状态：图片上传列表 ============
  const [fileList, setFileList] = useState([]);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState('');
  // ===========================================
  // 假设这是一个“修改”场景，我们加载数据
  // 实际开发中，你应该先判断是 Create 还是 Update
  useEffect(() => {
    // 模拟数据回填
    const formData = {
        ...mockExistingData,
        // 注意：Antd DatePicker 需要 dayjs 对象，不能直接给字符串
        openedAt: dayjs(mockExistingData.openedAt, 'YYYY-MM-DD')
        
    };
    // 2. 新增：处理图片回显 (String[] -> FileList[])
    if (mockExistingData.images && mockExistingData.images.length > 0) {
        const formattedFiles = mockExistingData.images.map((url, index) => ({
            uid: `-${index}`, // 必须是唯一的 uid
            name: `image-${index}.png`,
            status: 'done',
            url: url
        }));
        setFileList(formattedFiles);
    }
    form.setFieldsValue(formData);
  }, [form]);
// ============ 新增：模拟上传请求 ============
  // 因为没有真实后端，我们用这个函数假装上传成功
  const customRequest = ({ file, onSuccess }) => {
    setTimeout(() => {
      // 这里的 url 通常是后端返回的 oss 地址
      // 这里我随机返回一张网络图片模拟上传成功
      const mockUrl = "https://images.unsplash.com/photo-1582719508461-905c673771fd?ixlib=rb-4.0.3";
      onSuccess(mockUrl);
    }, 1000);
  };

  // 处理 Upload 组件的变化
  const handleUploadChange = ({ fileList: newFileList }) => {
    // 如果上传成功，把后端返回的 url 挂载到 file 对象上
    newFileList = newFileList.map(file => {
      if (file.response) {
        file.url = file.response; // 将 mockUrl 赋值给 file.url
      }
      return file;
    });
    setFileList(newFileList);
  };

  // 处理预览
  const handlePreview = async (file) => {
    setPreviewImage(file.url || file.thumbUrl);
    setPreviewOpen(true);
  };
  // ==========================================


  const onFinish = (values) => {
    // 1. 数据格式化
    const submitData = {
        ...values,
        // 把 dayjs 对象转回字符串传给后端
        openedAt: values.openedAt ? values.openedAt.format('YYYY-MM-DD') : null
    };

    console.log('提交给后端的数据:', submitData);

    // 2. 模拟API提交
    message.loading({ content: '正在提交...', key: 'updatable' });
    setTimeout(() => {
      message.success({ content: '提交成功！请等待管理员审核', key: 'updatable', duration: 2 });
      navigate('/admin/my-hotel'); // 提交成功后跳回查看页
    }, 1000);
  };

  return (
    <div style={{ padding: 24 }}>
      <Card title="编辑酒店信息">
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          initialValues={{ rooms: [{}] }} // 默认给一个空的房型
        >
          {/* --- 基础信息模块 --- */}
          <Divider orientation="left">基本信息</Divider>
          
          <div style={{ display: 'flex', gap: '20px' }}>
            <Form.Item label="中文名称" name="nameCn" rules={[{ required: true }]} style={{ flex: 1 }}>
              <Input placeholder="请输入酒店中文名" />
            </Form.Item>
            <Form.Item label="英文名称" name="nameEn" style={{ flex: 1 }}>
              <Input placeholder="请输入酒店英文名" />
            </Form.Item>
          </div>

          <Form.Item label="详细地址" name="address" rules={[{ required: true }]}>
             <TextArea rows={2} />
          </Form.Item>

          <div style={{ display: 'flex', gap: '20px' }}>
             <Form.Item label="星级" name="star" rules={[{ required: true }]}>
                <Rate />
             </Form.Item>
             <Form.Item label="开业时间" name="openedAt" rules={[{ required: true }]}>
                <DatePicker style={{ width: '100%' }} />
             </Form.Item>
          </div>

          <Form.Item label="特色标签" name="tags" help="可以直接输入内容并回车，创建新标签">
            <Select mode="tags" style={{ width: '100%' }} placeholder="选择或输入标签" tokenSeparators={[',']}>
                <Select.Option value="免费Wifi">免费Wifi</Select.Option>
                <Select.Option value="免费停车">免费停车</Select.Option>
                <Select.Option value="含早餐">含早餐</Select.Option>
            </Select>
          </Form.Item>
           {/* ============ 新增：图片上传模块 ============ */}
          <Divider orientation="left">酒店相册</Divider>
          <Form.Item label="酒店外观/内饰图" tooltip="支持jpg/png格式">
            <Upload
                listType="picture-card"
                fileList={fileList}
                customRequest={customRequest} // 使用模拟上传
                onChange={handleUploadChange}
                onPreview={handlePreview}
            >
                {fileList.length >= 8 ? null : (
                    <div>
                        <PlusOutlined />
                        <div style={{ marginTop: 8 }}>上传图片</div>
                    </div>
                )}
            </Upload>
          </Form.Item>
          {/* ======================================== */}
          {/* --- 房型设置模块 (动态表单核心) --- */}
          <Divider orientation="left">房型设置</Divider>
          
          <Form.List name="rooms">
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name, ...restField }) => (
                  <Space key={key} style={{ display: 'flex', marginBottom: 8 }} align="baseline">
                    
                    <Form.Item
                      {...restField}
                      name={[name, 'name']}
                      rules={[{ required: true, message: '请输入房型' }]}
                    >
                      <Input placeholder="房型名称 (如: 标准间)" style={{ width: 200 }} />
                    </Form.Item>

                    <Form.Item
                      {...restField}
                      name={[name, 'price']}
                      rules={[{ required: true, message: '缺价格' }]}
                    >
                      <InputNumber placeholder="价格" prefix="￥" style={{ width: 120 }} />
                    </Form.Item>

                    <Form.Item
                      {...restField}
                      name={[name, 'count']}
                      rules={[{ required: true, message: '缺数量' }]}
                    >
                      <InputNumber placeholder="房量" style={{ width: 100 }} />
                    </Form.Item>

                    <MinusCircleOutlined onClick={() => remove(name)} style={{ color: 'red' }} />
                  </Space>
                ))}
                
                <Form.Item>
                  <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                    添加房型
                  </Button>
                </Form.Item>
              </>
            )}
          </Form.List>

          <Form.Item style={{ marginTop: 24, textAlign: 'center' }}>
            <Button type="primary" htmlType="submit" size="large" icon={<SaveOutlined />}>
              提交保存
            </Button>
          </Form.Item>
              
          {/* 图片预览弹窗 */}
          <Modal open={previewOpen} footer={null} onCancel={() => setPreviewOpen(false)}>
            <img alt="preview" style={{ width: '100%' }} src={previewImage} />
          </Modal>
        </Form>
      </Card>
    </div>
  );
};

export default MerchantHotelEdit;