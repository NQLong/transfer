CREATE OR REPLACE FUNCTION FW_STUDENT_SEARCH_PAGE(pageNumber IN OUT NUMBER, pageSize IN OUT NUMBER,
                                       searchTerm IN STRING, filter IN STRING,
                                       totalItem OUT NUMBER, pageTotal OUT NUMBER) RETURN SYS_REFCURSOR
AS
    STUDENT_INFO          SYS_REFCURSOR;
    ST                    STRING(500) := '%' || lower(searchTerm) || '%';
    listFaculty           STRING(50);
    listFromCity          STRING(50);
    listEthnic            STRING(50);
    listNationality       STRING(50);
    listReligion          STRING(50);
    listLoaiHinhDaoTao    STRING(50);
    listLoaiSinhVien      STRING(50);
    listTinhTrangSinhVien STRING(50);
    listKhoaSinhVien      STRING(50);
    gender                STRING(5);

BEGIN
    SELECT JSON_VALUE(filter, '$.listFaculty') INTO listFaculty FROM DUAL;
    SELECT JSON_VALUE(filter, '$.listFromCity') INTO listFromCity FROM DUAL;
    SELECT JSON_VALUE(filter, '$.listFaculty') INTO listFaculty FROM DUAL;
    SELECT JSON_VALUE(filter, '$.listEthnic') INTO listEthnic FROM DUAL;
    SELECT JSON_VALUE(filter, '$.listNationality') INTO listNationality FROM DUAL;
    SELECT JSON_VALUE(filter, '$.listReligion') INTO listReligion FROM DUAL;
    SELECT JSON_VALUE(filter, '$.listLoaiHinhDaoTao') INTO listLoaiHinhDaoTao FROM DUAL;
    SELECT JSON_VALUE(filter, '$.listLoaiSinhVien') INTO listLoaiSinhVien FROM DUAL;
    SELECT JSON_VALUE(filter, '$.listTinhTrangSinhVien') INTO listTinhTrangSinhVien FROM DUAL;
    SELECT JSON_VALUE(filter, '$.listKhoaSinhVien') INTO listKhoaSinhVien FROM DUAL;
    SELECT JSON_VALUE(filter, '$.gender') INTO gender FROM DUAL;

    SELECT COUNT(*)
    INTO totalItem

    FROM FW_STUDENT STU
             LEFT JOIN DM_SV_LOAI_HINH_DAO_TAO LHDT ON LHDT.MA = STU.LOAI_HINH_DAO_TAO
             LEFT JOIN DM_LOAI_SINH_VIEN LSV on LSV.MA = STU.LOAI_SINH_VIEN
             LEFT JOIN DM_GIOI_TINH GT ON GT.MA = STU.GIOI_TINH
             LEFT JOIN DM_QUOC_GIA QG ON QG.MA_CODE = STU.QUOC_GIA
             LEFT JOIN DM_DAN_TOC DANTOC ON DANTOC.MA = STU.DAN_TOC
             LEFT JOIN DM_TON_GIAO TONGIAO ON TONGIAO.MA = STU.TON_GIAO
             LEFT JOIN DM_TINH_THANH_PHO TINHTHANH ON TINHTHANH.MA = STU.THUONG_TRU_MA_TINH
             LEFT JOIN DM_DON_VI KHOA ON KHOA.MA = STU.KHOA
             LEFT JOIN DM_TINH_TRANG_SINH_VIEN TTSV ON TTSV.MA = STU.TINH_TRANG
    WHERE (
            (listFaculty IS NOT NULL AND STU.KHOA IN (SELECT regexp_substr(listFaculty, '[^,]+', 1, level)
                                                      from dual
                                                      connect by regexp_substr(listFaculty, '[^,]+', 1, level) is not null) OR
             listFaculty IS NULL)
            AND (listFromCity IS NOT NULL AND INSTR(listFromCity, STU.THUONG_TRU_MA_TINH) != 0 OR
                 listFromCity IS NULL)
            AND (listKhoaSinhVien IS NOT NULL AND INSTR(listKhoaSinhVien, STU.NAM_TUYEN_SINH) != 0 OR
                 listKhoaSinhVien IS NULL)
            AND (listEthnic IS NOT NULL AND INSTR(listEthnic, STU.DAN_TOC) != 0 OR listEthnic IS NULL)
            AND
            (listNationality IS NOT NULL AND INSTR(listNationality, STU.QUOC_GIA) != 0 OR listNationality IS NULL)
            AND (listReligion IS NOT NULL AND INSTR(listReligion, STU.DAN_TOC) != 0 OR listReligion IS NULL)
            AND (listLoaiHinhDaoTao IS NOT NULL AND INSTR(listLoaiHinhDaoTao, STU.LOAI_HINH_DAO_TAO) != 0 OR
                 listLoaiHinhDaoTao IS NULL)
            AND (listLoaiSinhVien IS NOT NULL AND INSTR(listLoaiSinhVien, STU.LOAI_SINH_VIEN) != 0 OR
                 listLoaiSinhVien IS NULL)
            AND (listTinhTrangSinhVien IS NOT NULL AND INSTR(listTinhTrangSinhVien, STU.TINH_TRANG) != 0 OR
                 listTinhTrangSinhVien IS NULL)
            AND (gender IS NOT NULL AND ('0' + STU.GIOI_TINH) = gender OR gender IS NULL))
      AND (searchTerm = ''
        OR LOWER(STU.MSSV) LIKE sT
        OR LOWER(TRIM(STU.HO || ' ' || STU.TEN)) LIKE sT
        OR LOWER(STU.MA_NGANH) LIKE sT
        OR LOWER(STU.LOP) LIKE sT
        OR LOWER(STU.DIEN_THOAI_CA_NHAN) LIKE sT
        OR LOWER(STU.DIEN_THOAI_LIEN_LAC) LIKE sT
        OR LOWER(STU.EMAIL_CA_NHAN) LIKE sT);


    IF pageNumber < 1 THEN pageNumber := 1; END IF;
    IF pageSize < 1 THEN pageSize := 1; END IF;
    pageTotal := CEIL(totalItem / pageSize);
    pageNumber := LEAST(pageNumber, pageTotal);

    OPEN STUDENT_INFO FOR
        SELECT *
        FROM (SELECT STU.MSSV           AS                                                     "mssv",
                     STU.HO             AS                                                     "ho",
                     STU.TEN            AS                                                     "ten",
                     STU.EMAIL_CA_NHAN  AS                                                     "emailCaNhan",
                     STU.EMAIL_TRUONG   AS                                                     "emailTruong",
                     STU.NGAY_SINH      AS                                                     "ngaySinh",
                     STU.GIOI_TINH      AS                                                     "gioiTinh",
                     STU.DAN_TOC        AS                                                     "maDanToc",
                     STU.QUOC_GIA       AS                                                     "maQuocGia",
                     LSV.TEN            AS                                                     "loaiSinhVien",
                     LHDT.TEN           AS                                                     "loaiHinhDaoTao",
                     TTSV.TEN           AS                                                     "tinhTrangSinhVien",
                     STU.KHOA           AS                                                     "khoa",
                     TINHTHANH.TEN      AS                                                     "tinhThanhThuongTru",
                     KHOA.TEN           AS                                                     "tenKhoa",
                     STU.MA_NGANH       AS                                                     "maNganh",
                     STU.LOP            AS                                                     "lop",
                     TONGIAO.TEN        AS                                                     "tonGiao",
                     QG.TEN_QUOC_GIA    AS                                                     "quocTich",
                     DANTOC.TEN         AS                                                     "danToc",
                     STU.NAM_TUYEN_SINH AS                                                     "namTuyenSinh",
                     STU.NGAY_NHAP_HOC  AS                                                     "ngayNhapHoc",
                     STU.CAN_EDIT       AS                                                     "canEdit",
                     ROW_NUMBER() OVER (ORDER BY STU.NAM_TUYEN_SINH DESC NULLS LAST, STU.TEN ) R
              FROM FW_STUDENT STU
                       LEFT JOIN DM_SV_LOAI_HINH_DAO_TAO LHDT ON LHDT.MA = STU.LOAI_HINH_DAO_TAO
                       LEFT JOIN DM_LOAI_SINH_VIEN LSV on LSV.MA = STU.LOAI_SINH_VIEN
                       LEFT JOIN DM_GIOI_TINH GT ON GT.MA = STU.GIOI_TINH
                       LEFT JOIN DM_QUOC_GIA QG ON QG.MA_CODE = STU.QUOC_GIA
                       LEFT JOIN DM_DAN_TOC DANTOC ON DANTOC.MA = STU.DAN_TOC
                       LEFT JOIN DM_TON_GIAO TONGIAO ON TONGIAO.MA = STU.TON_GIAO
                       LEFT JOIN DM_TINH_THANH_PHO TINHTHANH ON TINHTHANH.MA = STU.THUONG_TRU_MA_TINH
                       LEFT JOIN DM_DON_VI KHOA ON KHOA.MA = STU.KHOA
                       LEFT JOIN DM_TINH_TRANG_SINH_VIEN TTSV ON TTSV.MA = STU.TINH_TRANG
              WHERE (
                      (listFaculty IS NOT NULL AND STU.KHOA IN (SELECT regexp_substr(listFaculty, '[^,]+', 1, level)
                                                                from dual
                                                                connect by regexp_substr(listFaculty, '[^,]+', 1, level) is not null) OR
                       listFaculty IS NULL)
                      AND (listFromCity IS NOT NULL AND INSTR(listFromCity, STU.THUONG_TRU_MA_TINH) != 0 OR
                           listFromCity IS NULL)
                      AND (listKhoaSinhVien IS NOT NULL AND INSTR(listKhoaSinhVien, STU.NAM_TUYEN_SINH) != 0 OR
                           listKhoaSinhVien IS NULL)
                      AND (listEthnic IS NOT NULL AND INSTR(listEthnic, STU.DAN_TOC) != 0 OR listEthnic IS NULL)
                      AND (listNationality IS NOT NULL AND INSTR(listNationality, STU.QUOC_GIA) != 0 OR
                           listNationality IS NULL)
                      AND
                      (listReligion IS NOT NULL AND INSTR(listReligion, STU.DAN_TOC) != 0 OR listReligion IS NULL)
                      AND
                      (listLoaiHinhDaoTao IS NOT NULL AND INSTR(listLoaiHinhDaoTao, STU.LOAI_HINH_DAO_TAO) != 0 OR
                       listLoaiHinhDaoTao IS NULL)
                      AND (listLoaiSinhVien IS NOT NULL AND INSTR(listLoaiSinhVien, STU.LOAI_SINH_VIEN) != 0 OR
                           listLoaiSinhVien IS NULL)
                      AND (listTinhTrangSinhVien IS NOT NULL AND INSTR(listTinhTrangSinhVien, STU.TINH_TRANG) != 0 OR
                           listTinhTrangSinhVien IS NULL)
                      AND (gender IS NOT NULL AND ('0' + STU.GIOI_TINH) = gender OR gender IS NULL))
                AND (searchTerm = ''
                  OR LOWER(STU.MSSV) LIKE sT
                  OR LOWER(TRIM(STU.HO || ' ' || STU.TEN)) LIKE sT
                  OR LOWER(STU.MA_NGANH) LIKE sT
                  OR LOWER(STU.LOP) LIKE sT
                  OR LOWER(STU.DIEN_THOAI_CA_NHAN) LIKE sT
                  OR LOWER(STU.DIEN_THOAI_LIEN_LAC) LIKE sT
                  OR LOWER(STU.EMAIL_CA_NHAN) LIKE sT)
              ORDER BY STU.NAM_TUYEN_SINH DESC NULLS LAST, STU.TEN)
        WHERE R BETWEEN (pageNumber - 1) * pageSize + 1 AND pageNumber * pageSize;
    RETURN STUDENT_INFO;
end;

/
--EndMethod--