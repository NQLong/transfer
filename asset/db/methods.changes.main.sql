CREATE OR REPLACE FUNCTION DT_CALENDAR(room IN STRING, idNam IN NUMBER, hocKy IN NUMBER) RETURN SYS_REFCURSOR
AS
    my_cursor SYS_REFCURSOR;
BEGIN
    OPEN my_cursor FOR
        SELECT *
        FROM (SELECT TKB.MA_MON_HOC            AS "maMonHoc",
                     TKB.TIET_BAT_DAU          AS "tietBatDau",
                     TKB.NGAY_BAT_DAU          AS "ngayBatDau",
                     TKB.NGAY_KET_THUC         AS "ngayKetThuc",
                     TKB.SO_TIET_BUOI          AS "soTiet",
                     TKB.GIANG_VIEN            AS "giangVien",
                     TKB.NHOM                  AS "nhom",
                     TKB.THU                   AS "thu",
                     TIETBD.THOI_GIAN_BAT_DAU  AS "thoiGianBatDau",
                     TIETKT.THOI_GIAN_KET_THUC AS "thoiGianKetThuc"
              FROM DT_THOI_KHOA_BIEU TKB
                       LEFT JOIN DM_CA_HOC TIETBD on TIETBD.TEN = TKB.TIET_BAT_DAU AND TIETBD.MA_CO_SO = 2
                       LEFT JOIN DM_CA_HOC TIETKT
                                 on TO_NUMBER(TIETKT.TEN) = TO_NUMBER(TKB.TIET_BAT_DAU) + TO_NUMBER(TKB.SO_TIET_BUOI) AND
                                    TIETKT.MA_CO_SO = 2
              WHERE room = TKB.PHONG
                AND idNam = TKB.NAM
                AND hocKy = TKB.HOC_KY);
    RETURN my_cursor;

end;

/
--EndMethod--

CREATE OR REPLACE FUNCTION HCTH_PHAN_HOI_GET_ALL_FROM(
    target IN NUMBER,
    targetType in STRING
) RETURN SYS_REFCURSOR AS
    my_cursor SYS_REFCURSOR;
BEGIN

    OPEN my_cursor FOR
        SELECT ph.ID         as "id",
               ph.NOI_DUNG   as "noiDung",
               ph.CAN_BO_GUI as "canBoGui",
               ph.NGAY_TAO   as "ngayTao",
               cb.HO         as "ho",
               cb.TEN        as "ten",
               DMCV.TEN      as "chucVu",
               usr.IMAGE     AS "image",
               fi.ID         AS "fileId",
               fi.TEN        AS "tenFile"


        FROM HCTH_PHAN_HOI ph
                 LEFT JOIN TCHC_CAN_BO cb on ph.CAN_BO_GUI = cb.SHCC
                 LEFT JOIN QT_CHUC_VU qtcv ON cb.SHCC = qtcv.SHCC AND CHUC_VU_CHINH = 1
                 LEFT JOIN DM_CHUC_VU DMCV ON DMCV.MA = qtcv.MA_CHUC_VU
                 LEFT JOIN FW_USER usr on usr.SHCC = cb.shcc
                 LEFT JOIN HCTH_FILE fi on fi.LOAI = 'PHAN_HOI' and fi.MA = ph.id


        WHERE (target is not null and ph.KEY = target and ph.loai is not null and targetType = ph.loai)
        ORDER BY NGAY_TAO;
    RETURN my_cursor;
END;

/
--EndMethod--

